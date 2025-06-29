const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./utils/initDatabase');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workflowRoutes = require('./routes/workflows');
const templateRoutes = require('./routes/templates');
const executionRoutes = require('./routes/executions');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/executions', executionRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize databases and start server
async function startServer() {
  try {
    // Initialize database tables and get open database instances
    const { authDb, workflowDb, executionDb } = await initializeDatabase();
    
    // Make database instances available to all routes
    app.locals.authDb = authDb;
    app.locals.workflowDb = workflowDb;
    app.locals.executionDb = executionDb;

    // Initialize Redis (optional - gracefully handle failure)
    try {
      const { RedisClient } = require('./utils/redis');
      const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');
      app.locals.redis = redis;
      logger.info('Redis client initialized');
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without Redis:', redisError.message);
      // Create a mock redis client that does nothing
      app.locals.redis = {
        get: async () => null,
        set: async () => {},
        del: async () => {},
        exists: async () => false,
        isConnected: () => false
      };
    }

    logger.info('Connected to all databases');
    
    app.listen(PORT, () => {
      logger.info(`Monolithic backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    if (app.locals.authDb) await app.locals.authDb.close();
    if (app.locals.workflowDb) await app.locals.workflowDb.close();
    if (app.locals.executionDb) await app.locals.executionDb.close();
    if (app.locals.redis && app.locals.redis.close) await app.locals.redis.close();
  } catch (error) {
    logger.error('Error closing connections:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    if (app.locals.authDb) await app.locals.authDb.close();
    if (app.locals.workflowDb) await app.locals.workflowDb.close();
    if (app.locals.executionDb) await app.locals.executionDb.close();
    if (app.locals.redis && app.locals.redis.close) await app.locals.redis.close();
  } catch (error) {
    logger.error('Error closing connections:', error);
  }
  process.exit(0);
});