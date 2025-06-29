const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { Database } = require('../../shared/src/utils/database');
const { RedisClient } = require('../../shared/src/utils/redis');
const logger = require('../../shared/src/utils/logger');
const executionRoutes = require('./routes/executions');
const { authenticateToken } = require('../../shared/src/middleware/auth');
const { WorkflowEngine } = require('./engine/WorkflowEngine');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize database and Redis
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/execution.db');
const db = new Database(dbPath);
const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize workflow engine
const workflowEngine = new WorkflowEngine(db, redis);

// Make db, redis, and workflowEngine available to routes
app.locals.db = db;
app.locals.redis = redis;
app.locals.workflowEngine = workflowEngine;

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
app.use((err, req, res, next) => {
  logger.error('Execution service error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Initialize database and start the server
async function startServer() {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      logger.info(`Execution service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start execution service', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;