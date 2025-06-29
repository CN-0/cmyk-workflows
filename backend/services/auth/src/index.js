const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { Database } = require('../../../shared/src/utils/database');
const { RedisClient } = require('../../../shared/src/utils/redis');
const logger = require('../../../shared/src/utils/logger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database and Redis
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/auth.db');
const db = new Database(dbPath);
const redis = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

// Make db and redis available to routes
app.locals.db = db;
app.locals.redis = redis;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later.'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'auth',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/users', userRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start auth service', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;