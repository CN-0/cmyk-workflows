import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { Database } from '@flowforge/shared/src/utils/database';
import { RedisClient } from '@flowforge/shared/src/utils/redis';
import logger from '@flowforge/shared/src/utils/logger';
import workflowRoutes from './routes/workflows';
import templateRoutes from './routes/templates';
import { authenticateToken } from '@flowforge/shared/src/middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize database and Redis
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/workflow.db');
export const db = new Database(dbPath);
export const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

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
    service: 'workflow',
    timestamp: new Date().toISOString()
  });
});

// Routes (all routes require authentication)
app.use('/workflows', authenticateToken, workflowRoutes);
app.use('/templates', authenticateToken, templateRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Workflow service error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.connect();
    
    // Create workflows table
    await db.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
        definition TEXT NOT NULL,
        tags TEXT,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1
      )
    `);

    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status)');
    
    app.listen(PORT, () => {
      logger.info(`Workflow service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start workflow service', error);
    process.exit(1);
  }
}

startServer();

export default app;