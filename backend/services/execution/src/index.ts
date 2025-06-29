import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { Database } from '@flowforge/shared/src/utils/database';
import { RedisClient } from '@flowforge/shared/src/utils/redis';
import logger from '@flowforge/shared/src/utils/logger';
import executionRoutes from './routes/executions';
import { authenticateToken } from '@flowforge/shared/src/middleware/auth';
import { WorkflowEngine } from './engine/WorkflowEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize database and Redis
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/execution.db');
export const db = new Database(dbPath);
export const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize workflow engine
export const workflowEngine = new WorkflowEngine(db, redis);

// Security middleware
app.use(helmet());
app.use(cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'execution',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/executions', authenticateToken, executionRoutes);

// Webhook endpoint for external triggers (no auth required)
app.post('/webhook/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const triggerData = req.body;

    const executionId = await workflowEngine.triggerWorkflow(workflowId, 'webhook', triggerData);

    res.json({
      success: true,
      data: { executionId }
    });
  } catch (error) {
    logger.error('Webhook trigger error', error);
    res.status(500).json({ success: false, error: 'Failed to trigger workflow' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Execution service error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Initialize database and start the server
async function startServer() {
  try {
    await db.connect();
    
    // Create tables if they don't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        workflow_version INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        triggered_by TEXT NOT NULL,
        trigger_data TEXT,
        context TEXT DEFAULT '{}',
        current_node TEXT,
        error TEXT,
        metrics TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        node_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error')),
        message TEXT NOT NULL,
        data TEXT,
        duration INTEGER,
        FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE
      )
    `);
    
    app.listen(PORT, () => {
      logger.info(`Execution service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start execution service', error);
    process.exit(1);
  }
}

startServer();

export default app;