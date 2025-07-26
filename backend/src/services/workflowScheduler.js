
const cron = require('node-cron');
const logger = require('../utils/logger');
const WorkflowExecutor = require('./workflowExecutor');

class WorkflowScheduler {
  constructor(workflowDb, executionDb) {
    this.workflowDb = workflowDb;
    this.executionDb = executionDb;
    this.executor = new WorkflowExecutor(executionDb, workflowDb);
    this.scheduledTasks = new Map();
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Workflow scheduler starting...');
    
    // Load and schedule all active workflows with schedule triggers
    await this.loadScheduledWorkflows();
    
    // Start a periodic task to check for new scheduled workflows
    this.periodicCheck = cron.schedule('*/5 * * * *', async () => {
      await this.loadScheduledWorkflows();
    });

    logger.info('Workflow scheduler started');
  }

  async stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Stop all scheduled tasks
    for (const [workflowId, task] of this.scheduledTasks) {
      task.destroy();
    }
    this.scheduledTasks.clear();
    
    if (this.periodicCheck) {
      this.periodicCheck.destroy();
    }
    
    logger.info('Workflow scheduler stopped');
  }

  async loadScheduledWorkflows() {
    try {
      // Get all active workflows
      const result = await this.workflowDb.query(
        `SELECT w.*, wn.config 
         FROM workflows w
         JOIN workflow_nodes wn ON w.id = wn.workflow_id
         WHERE w.status = 'active' AND wn.type = 'schedule'`
      );

      const scheduledWorkflows = result.rows;

      // Process each scheduled workflow
      for (const workflow of scheduledWorkflows) {
        await this.scheduleWorkflow(workflow);
      }

      // Remove workflows that are no longer active or scheduled
      const activeWorkflowIds = new Set(scheduledWorkflows.map(w => w.id));
      for (const [workflowId, task] of this.scheduledTasks) {
        if (!activeWorkflowIds.has(workflowId)) {
          task.destroy();
          this.scheduledTasks.delete(workflowId);
          logger.info('Unscheduled workflow', { workflowId });
        }
      }

    } catch (error) {
      logger.error('Failed to load scheduled workflows', error);
    }
  }

  async scheduleWorkflow(workflow) {
    const workflowId = workflow.id;
    
    try {
      const scheduleConfig = JSON.parse(workflow.config);
      const cronExpression = scheduleConfig.cronExpression;
      
      if (!cronExpression) {
        logger.warn('Workflow has no cron expression', { workflowId });
        return;
      }

      // Check if already scheduled
      if (this.scheduledTasks.has(workflowId)) {
        return; // Already scheduled
      }

      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        logger.error('Invalid cron expression', { workflowId, cronExpression });
        return;
      }

      // Check execution constraints
      const now = new Date();
      if (scheduleConfig.startDate && new Date(scheduleConfig.startDate) > now) {
        logger.info('Workflow start date not reached', { workflowId, startDate: scheduleConfig.startDate });
        return;
      }

      if (scheduleConfig.endDate && new Date(scheduleConfig.endDate) < now) {
        logger.info('Workflow end date passed', { workflowId, endDate: scheduleConfig.endDate });
        return;
      }

      // Check max executions
      if (scheduleConfig.maxExecutions) {
        const executionCountResult = await this.executionDb.query(
          'SELECT COUNT(*) as count FROM workflow_executions WHERE workflow_id = ?',
          [workflowId]
        );
        
        const executionCount = executionCountResult.rows[0].count;
        if (executionCount >= scheduleConfig.maxExecutions) {
          logger.info('Workflow max executions reached', { workflowId, maxExecutions: scheduleConfig.maxExecutions });
          return;
        }
      }

      // Schedule the task
      const task = cron.schedule(cronExpression, async () => {
        await this.executeScheduledWorkflow(workflowId, scheduleConfig);
      }, {
        scheduled: true,
        timezone: scheduleConfig.timezone || 'UTC'
      });

      this.scheduledTasks.set(workflowId, task);
      
      logger.info('Workflow scheduled', { 
        workflowId, 
        name: workflow.name,
        cronExpression,
        timezone: scheduleConfig.timezone || 'UTC'
      });

    } catch (error) {
      logger.error('Failed to schedule workflow', { workflowId, error });
    }
  }

  async executeScheduledWorkflow(workflowId, scheduleConfig) {
    try {
      logger.info('Executing scheduled workflow', { workflowId });

      // Check execution constraints again
      const now = new Date();
      if (scheduleConfig.endDate && new Date(scheduleConfig.endDate) < now) {
        logger.info('Workflow end date reached, unscheduling', { workflowId });
        this.unscheduleWorkflow(workflowId);
        return;
      }

      if (scheduleConfig.maxExecutions) {
        const executionCountResult = await this.executionDb.query(
          'SELECT COUNT(*) as count FROM workflow_executions WHERE workflow_id = ?',
          [workflowId]
        );
        
        const executionCount = executionCountResult.rows[0].count;
        if (executionCount >= scheduleConfig.maxExecutions) {
          logger.info('Workflow max executions reached, unscheduling', { workflowId });
          this.unscheduleWorkflow(workflowId);
          return;
        }
      }

      // Execute the workflow
      const triggerData = {
        scheduledAt: now.toISOString(),
        trigger: 'schedule',
        executionCount: await this.getExecutionCount(workflowId) + 1
      };

      await this.executor.executeWorkflow(workflowId, triggerData, 'scheduler');

    } catch (error) {
      logger.error('Scheduled workflow execution failed', { workflowId, error });
    }
  }

  async getExecutionCount(workflowId) {
    const result = await this.executionDb.query(
      'SELECT COUNT(*) as count FROM workflow_executions WHERE workflow_id = ?',
      [workflowId]
    );
    return result.rows[0].count;
  }

  unscheduleWorkflow(workflowId) {
    if (this.scheduledTasks.has(workflowId)) {
      const task = this.scheduledTasks.get(workflowId);
      task.destroy();
      this.scheduledTasks.delete(workflowId);
      logger.info('Workflow unscheduled', { workflowId });
    }
  }

  getScheduledWorkflows() {
    return Array.from(this.scheduledTasks.keys());
  }
}

module.exports = WorkflowScheduler;
