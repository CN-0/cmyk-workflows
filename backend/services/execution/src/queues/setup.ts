import Queue from 'bull';
import { RedisClient } from '@flowforge/shared/src/utils/redis';
import logger from '@flowforge/shared/src/utils/logger';
import { WorkflowEngine } from '../engine/WorkflowEngine';

export async function setupQueues(redis: RedisClient, workflowEngine: WorkflowEngine) {
  // Create execution queue
  const executionQueue = new Queue('workflow execution', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });

  // Process workflow executions
  executionQueue.process('execute', async (job) => {
    const { executionId, workflowId, definition, triggerData } = job.data;
    
    logger.info('Processing workflow execution', { executionId, workflowId });
    
    try {
      await workflowEngine.executeWorkflow(executionId, workflowId, definition, triggerData);
      logger.info('Workflow execution completed', { executionId });
    } catch (error) {
      logger.error('Workflow execution failed', { executionId, error });
      throw error;
    }
  });

  // Listen for workflow execution requests
  await redis.subscribe('workflow:execute', async (message) => {
    try {
      const data = JSON.parse(message);
      await executionQueue.add('execute', data);
    } catch (error) {
      logger.error('Failed to queue workflow execution', error);
    }
  });

  // Queue event handlers
  executionQueue.on('completed', (job) => {
    logger.info('Job completed', { jobId: job.id });
  });

  executionQueue.on('failed', (job, err) => {
    logger.error('Job failed', { jobId: job.id, error: err.message });
  });

  executionQueue.on('stalled', (job) => {
    logger.warn('Job stalled', { jobId: job.id });
  });

  logger.info('Execution queues initialized');
}