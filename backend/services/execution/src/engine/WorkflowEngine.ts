import { v4 as uuidv4 } from 'uuid';
import { Database } from '@flowforge/shared/src/utils/database';
import { RedisClient } from '@flowforge/shared/src/utils/redis';
import logger from '@flowforge/shared/src/utils/logger';
import { NodeExecutor } from './NodeExecutor';

export class WorkflowEngine {
  private nodeExecutor: NodeExecutor;

  constructor(private db: Database, private redis: RedisClient) {
    this.nodeExecutor = new NodeExecutor(db, redis);
  }

  async triggerWorkflow(workflowId: string, triggeredBy: string, triggerData?: any): Promise<string> {
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

  async executeWorkflow(executionId: string, workflowId: string, definition: any, triggerData?: any): Promise<void> {
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
      await this.updateExecutionStatus(executionId, 'failed', (error as Error).message);
      await this.logExecution(executionId, 'workflow', 'error', `Workflow execution failed: ${(error as Error).message}`);
    }
  }

  private async updateExecutionStatus(executionId: string, status: string, error?: string): Promise<void> {
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

  private async logExecution(
    executionId: string,
    nodeId: string,
    level: 'debug' | 'info' | 'warning' | 'error',
    message: string,
    data?: any
  ): Promise<void> {
    const logId = uuidv4();
    await this.db.query(
      `INSERT INTO execution_logs (id, execution_id, node_id, level, message, data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [logId, executionId, nodeId, level, message, data ? JSON.stringify(data) : null]
    );
  }

  async getExecution(executionId: string): Promise<any | null> {
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

  async cancelExecution(executionId: string): Promise<void> {
    await this.updateExecutionStatus(executionId, 'cancelled');
    await this.logExecution(executionId, 'workflow', 'info', 'Workflow execution cancelled');
  }
}