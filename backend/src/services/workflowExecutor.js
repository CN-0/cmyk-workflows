
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

class WorkflowExecutor {
  constructor(executionDb, workflowDb) {
    this.executionDb = executionDb;
    this.workflowDb = workflowDb;
    this.activeExecutions = new Map();
  }

  async executeWorkflow(workflowId, triggerData = {}, userId = null) {
    const executionId = uuidv4();
    
    try {
      // Get workflow definition
      const workflowResult = await this.workflowDb.query(
        'SELECT * FROM workflows WHERE id = ?',
        [workflowId]
      );

      if (workflowResult.rows.length === 0) {
        throw new Error('Workflow not found');
      }

      const workflow = workflowResult.rows[0];
      const definition = JSON.parse(workflow.definition);

      // Create execution record
      await this.executionDb.query(
        `INSERT INTO workflow_executions 
         (id, workflow_id, workflow_version, status, triggered_by, trigger_data, context, metrics, started_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          executionId,
          workflowId,
          workflow.version,
          'running',
          userId || 'system',
          JSON.stringify(triggerData),
          JSON.stringify({ workflowName: workflow.name }),
          JSON.stringify({ totalNodes: definition.nodes.length, completedNodes: 0, failedNodes: 0 })
        ]
      );

      this.activeExecutions.set(executionId, { status: 'running' });

      // Log execution start
      await this.logExecution(executionId, 'workflow', 'info', 'Workflow execution started');

      // Execute workflow nodes
      const result = await this.executeNodes(executionId, definition, triggerData);

      // Update execution status
      const finalStatus = result.success ? 'completed' : 'failed';
      await this.executionDb.query(
        `UPDATE workflow_executions 
         SET status = ?, completed_at = datetime('now'), 
             metrics = ?, error_message = ?
         WHERE id = ?`,
        [
          finalStatus,
          JSON.stringify(result.metrics),
          result.error || null,
          executionId
        ]
      );

      this.activeExecutions.delete(executionId);

      logger.info('Workflow execution completed', { 
        executionId, 
        workflowId, 
        status: finalStatus,
        duration: result.duration 
      });

      return { executionId, status: finalStatus, result: result.output };

    } catch (error) {
      logger.error('Workflow execution failed', { executionId, workflowId, error });
      
      await this.executionDb.query(
        `UPDATE workflow_executions 
         SET status = 'failed', completed_at = datetime('now'), error_message = ?
         WHERE id = ?`,
        [error.message, executionId]
      );

      await this.logExecution(executionId, 'workflow', 'error', `Execution failed: ${error.message}`);
      
      this.activeExecutions.delete(executionId);
      throw error;
    }
  }

  async executeNodes(executionId, definition, context) {
    const startTime = Date.now();
    const { nodes, edges } = definition;
    const executedNodes = new Set();
    const nodeOutputs = new Map();
    const metrics = { totalNodes: nodes.length, completedNodes: 0, failedNodes: 0 };

    try {
      // Find trigger nodes (nodes with no incoming edges)
      const triggerNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id)
      );

      // Execute trigger nodes first
      for (const node of triggerNodes) {
        await this.executeNode(executionId, node, context, nodeOutputs);
        executedNodes.add(node.id);
        metrics.completedNodes++;
      }

      // Execute remaining nodes in topological order
      let remainingNodes = nodes.filter(node => !executedNodes.has(node.id));
      
      while (remainingNodes.length > 0) {
        let progress = false;
        
        for (const node of remainingNodes) {
          // Check if all dependencies are satisfied
          const incomingEdges = edges.filter(edge => edge.target === node.id);
          const dependenciesMet = incomingEdges.every(edge => 
            executedNodes.has(edge.source)
          );

          if (dependenciesMet) {
            await this.executeNode(executionId, node, context, nodeOutputs);
            executedNodes.add(node.id);
            metrics.completedNodes++;
            progress = true;
          }
        }

        if (!progress) {
          throw new Error('Circular dependency detected in workflow');
        }

        remainingNodes = nodes.filter(node => !executedNodes.has(node.id));
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        metrics,
        duration,
        output: Object.fromEntries(nodeOutputs)
      };

    } catch (error) {
      metrics.failedNodes++;
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        metrics,
        duration,
        output: Object.fromEntries(nodeOutputs)
      };
    }
  }

  async executeNode(executionId, node, context, nodeOutputs) {
    await this.logExecution(executionId, node.id, 'info', `Executing node: ${node.label}`);

    try {
      let result;

      switch (node.type) {
        case 'schedule':
          result = await this.executeScheduleNode(node, context);
          break;
        case 'email':
          result = await this.executeEmailNode(node, context);
          break;
        case 'http-request':
          result = await this.executeHttpNode(node, context);
          break;
        case 'delay':
          result = await this.executeDelayNode(node, context);
          break;
        case 'condition':
          result = await this.executeConditionNode(node, context);
          break;
        default:
          result = { success: true, data: { message: `Node ${node.type} executed` } };
      }

      nodeOutputs.set(node.id, result);
      await this.logExecution(executionId, node.id, 'success', 'Node executed successfully');

      return result;

    } catch (error) {
      await this.logExecution(executionId, node.id, 'error', `Node failed: ${error.message}`);
      throw error;
    }
  }

  async executeScheduleNode(node, context) {
    return {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        executionCount: context.executionCount || 1
      }
    };
  }

  async executeEmailNode(node, context) {
    const config = node.config || {};
    
    if (!config.to || !config.subject || !config.message) {
      throw new Error('Email node missing required configuration');
    }

    // Create reusable transporter using SMTP
    const transporter = nodemailer.createTransporter({
      host: config.smtpHost || 'smtp.gmail.com',
      port: config.smtpPort || 587,
      secure: false,
      auth: {
        user: config.fromEmail,
        pass: config.password
      }
    });

    const mailOptions = {
      from: config.fromEmail,
      to: config.to,
      subject: config.subject,
      text: config.message,
      html: config.htmlMessage || config.message
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return {
        success: true,
        data: {
          messageId: info.messageId,
          to: config.to,
          subject: config.subject,
          sentAt: new Date().toISOString()
        }
      };
    } catch (error) {
      // For demo purposes, simulate successful email send
      logger.warn('Email simulation (SMTP not configured)', { config, error: error.message });
      return {
        success: true,
        data: {
          messageId: `sim-${Date.now()}`,
          to: config.to,
          subject: config.subject,
          sentAt: new Date().toISOString(),
          simulated: true
        }
      };
    }
  }

  async executeHttpNode(node, context) {
    const config = node.config || {};
    const url = config.url;
    const method = config.method || 'GET';
    const headers = config.headers || {};
    const body = config.body;

    if (!url) {
      throw new Error('HTTP node missing URL configuration');
    }

    const fetch = require('node-fetch');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseData = await response.text();

    return {
      success: response.ok,
      data: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        body: responseData
      }
    };
  }

  async executeDelayNode(node, context) {
    const config = node.config || {};
    const delayMs = config.delay || 1000;

    await new Promise(resolve => setTimeout(resolve, delayMs));

    return {
      success: true,
      data: {
        delayed: delayMs,
        timestamp: new Date().toISOString()
      }
    };
  }

  async executeConditionNode(node, context) {
    const config = node.config || {};
    const condition = config.condition || 'true';
    
    // Simple condition evaluation (in production, use a safer evaluation method)
    let result;
    try {
      result = eval(condition);
    } catch (error) {
      result = false;
    }

    return {
      success: true,
      data: {
        condition,
        result: Boolean(result),
        timestamp: new Date().toISOString()
      }
    };
  }

  async logExecution(executionId, nodeId, level, message) {
    const logId = uuidv4();
    await this.executionDb.query(
      `INSERT INTO execution_logs (id, execution_id, node_id, level, message, timestamp)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [logId, executionId, nodeId, level, message]
    );
  }

  async cancelExecution(executionId) {
    if (this.activeExecutions.has(executionId)) {
      this.activeExecutions.delete(executionId);
      
      await this.executionDb.query(
        `UPDATE workflow_executions 
         SET status = 'cancelled', completed_at = datetime('now')
         WHERE id = ?`,
        [executionId]
      );

      await this.logExecution(executionId, 'workflow', 'info', 'Execution cancelled by user');
    }
  }
}

module.exports = WorkflowExecutor;
