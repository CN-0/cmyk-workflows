const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { Database } = require('./utils/database');
const { RedisClient } = require('./utils/redis');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workflowRoutes = require('./routes/workflows');
const templateRoutes = require('./routes/templates');
const executionRoutes = require('./routes/executions');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize databases
const authDbPath = process.env.AUTH_DATABASE_PATH || path.join(__dirname, '../data/auth.db');
const workflowDbPath = process.env.WORKFLOW_DATABASE_PATH || path.join(__dirname, '../data/workflow.db');
const executionDbPath = process.env.EXECUTION_DATABASE_PATH || path.join(__dirname, '../data/execution.db');

const authDb = new Database(authDbPath);
const workflowDb = new Database(workflowDbPath);
const executionDb = new Database(executionDbPath);

// Initialize Redis
const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Make databases and redis available to routes
app.locals.authDb = authDb;
app.locals.workflowDb = workflowDb;
app.locals.executionDb = executionDb;
app.locals.redis = redis;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later.'
});

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/executions', executionRoutes);

// Webhook endpoint for external triggers (no auth required)
app.post('/webhook/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const triggerData = req.body;

    // TODO: Implement workflow triggering
    const executionId = `exec-${Date.now()}`;

    res.json({
      success: true,
      data: { executionId }
    });
  } catch (error) {
    logger.error('Webhook trigger error', error);
    res.status(500).json({ success: false, error: 'Failed to trigger workflow' });
  }
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Initialize databases and start server
async function startServer() {
  try {
    await authDb.connect();
    await workflowDb.connect();
    await executionDb.connect();
    
    logger.info('Connected to all databases');
    
    app.listen(PORT, () => {
      logger.info(`Monolithic backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;