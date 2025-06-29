const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Database } = require('./utils/database');
const { RedisClient } = require('./utils/redis');
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/executions', executionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Initialize databases and start server
async function startServer() {
  try {
    // Initialize database tables and get open database instances
    const { authDb, workflowDb, executionDb } = await initializeDatabase();
    console.log(authDb)
    
    // Create Database wrapper instances with the open database connections
    app.locals.authDb = new Database(authDb);
    app.locals.workflowDb = new Database(workflowDb);
    app.locals.executionDb = new Database(executionDb);

    // Initialize Redis (optional)
    try {
      const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');
      app.locals.redis = redis;
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without Redis:', redisError);
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
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    if (app.locals.authDb) await app.locals.authDb.close();
    if (app.locals.workflowDb) await app.locals.workflowDb.close();
    if (app.locals.executionDb) await app.locals.executionDb.close();
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
  process.exit(0);
});