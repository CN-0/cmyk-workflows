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

// Initialize database connections
async function connectToAllDatabases() {
  try {
    // Initialize auth database
    const authDb = new Database('./backend/data/auth.db');
    await authDb.connect();
    app.locals.authDb = authDb;

    // Initialize workflow database
    const workflowDb = new Database('./backend/data/workflow.db');
    await workflowDb.connect();
    app.locals.workflowDb = workflowDb;

    // Initialize execution database
    const executionDb = new Database('./backend/data/execution.db');
    await executionDb.connect();
    app.locals.executionDb = executionDb;

    // Initialize Redis (optional)
    const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');
    app.locals.redis = redis;

    logger.info('Connected to all databases');
  } catch (error) {
    logger.error('Failed to connect to databases:', error);
    throw error;
  }
}

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
    // Initialize database tables first
    await initializeDatabase();
    
    // Connect to databases
    await connectToAllDatabases();
    
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
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});