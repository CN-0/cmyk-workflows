const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { Database } = require('../../shared/src/utils/database');
const { RedisClient } = require('../../shared/src/utils/redis');
const logger = require('../../shared/src/utils/logger');
const workflowRoutes = require('./routes/workflows');
const templateRoutes = require('./routes/templates');
const { authenticateToken } = require('../../shared/src/middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize database and Redis
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/workflow.db');
const db = new Database(dbPath);
const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Make db and redis available to routes
app.locals.db = db;
app.locals.redis = redis;

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
app.use((err, req, res, next) => {
  logger.error('Workflow service error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      logger.info(`Workflow service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start workflow service', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;