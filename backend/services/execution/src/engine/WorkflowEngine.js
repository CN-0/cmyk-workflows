const { v4: uuidv4 } = require('uuid');
const logger = require('../../../../shared/src/utils/logger');
const { NodeExecutor } = require('./NodeExecutor');

class WorkflowEngine {
  constructor(db, redis) {
    this.db = db;
    this.redis = redis;
    this.nodeExecutor = new NodeExecutor(db, redis);
  }

  async triggerWorkflow(workflowId, triggeredBy, triggerData) {
    try {
      // For now, create a mock workflow execution since we don't have workflow service integration yet
      const executionId = uuidv4();
      
      await this.db.query(
        `INSERT INTO workflow_executions 
         (id, workflow_id, workflow_version, status, triggered_by, trigger_data, context, metrics)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          executionId,
          workflowId,
          1,
          'pending',
          triggeredBy,
          JSON.stringify(triggerData || {}),
          JSON.stringify({}),
          JSON.stringify({ totalNodes: 0, completedNodes: 0, failedNodes: 0 })
        ]
      );

      logger.info('Workflow triggered', { workflowId, executionId, triggeredBy });

      return executionId;
    } catch (error) {
      logger.error('Failed to trigger workflow', { workflowId, error });
      throw error;
    }
  }

  async executeWorkflow(executionId, workflowId, definition, triggerData) {
    try {
      // Update execution status to running
      await this.updateExecutionStatus(executionId, 'running');

      // For now, simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark execution as completed
      await this.updateExecutionStatus(executionId, 'completed');
      await this.logExecution(executionId, 'workflow', 'info', 'Workflow execution completed successfully');

    } catch (error) {
      logger.error('Workflow execution failed', { executionId, error });
      await this.updateExecutionStatus(executionId, 'failed', error.message);
      await this.logExecution(executionId, 'workflow', 'error', `Workflow execution failed: ${error.message}`);
    }
  }

  async updateExecutionStatus(executionId, status, error) {
    const updateFields = ['status = ?', 'updated_at = datetime(\'now\')'];
    const params = [status, executionId];

    if (status === 'completed' || status === 'failed') {
      updateFields.splice(1, 0, 'completed_at = datetime(\'now\')');
    }

    if (error) {
      updateFields.splice(-1, 0, 'error = ?');
      params.splice(-1, 0, error);
    }

    await this.db.query(
      `UPDATE workflow_executions SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async logExecution(executionId, nodeId, level, message, data) {
    const logId = uuidv4();
    await this.db.query(
      `INSERT INTO execution_logs (id, execution_id, node_id, level, message, data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [logId, executionId, nodeId, level, message, data ? JSON.stringify(data) : null]
    );
  }

  async getExecution(executionId) {
    const result = await this.db.query(
      'SELECT * FROM workflow_executions WHERE id = ?',
      [executionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const execution = result.rows[0];

    // Get logs
    const logsResult = await this.db.query(
      'SELECT * FROM execution_logs WHERE execution_id = ? ORDER BY timestamp ASC',
      [executionId]
    );

    return {
      ...execution,
      logs: logsResult.rows
    };
  }

  async cancelExecution(executionId) {
    await this.updateExecutionStatus(executionId, 'cancelled');
    await this.logExecution(executionId, 'workflow', 'info', 'Workflow execution cancelled');
  }
}

module.exports = { WorkflowEngine };