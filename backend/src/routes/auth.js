const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validateBody } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('admin', 'editor', 'viewer').default('editor')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Helper functions
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production', { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes
    tokenType: 'Bearer'
  };
};

// Register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const db = req.app.locals.authDb;

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await db.query(
      `INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, email, hashedPassword, name, role]
    );

    // Get the created user
    const userResult = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    const user = userResult.rows[0];
    const tokens = generateTokens(user);

    // Store refresh token in Redis
    const redis = req.app.locals.redis;
    try {
      await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60); // 7 days
    } catch (redisError) {
      logger.warn('Redis not available for token storage', redisError);
    }

    logger.info('User registered successfully', { userId: user.id, email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at
        },
        tokens
      }
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.authDb;

    // Find user
    const result = await db.query(
      'SELECT id, email, password, name, role, created_at FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token in Redis
    const redis = req.app.locals.redis;
    try {
      await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60);
    } catch (redisError) {
      logger.warn('Redis not available for token storage', redisError);
    }

    // Update last login
    await db.query('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?', [user.id]);

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at
        },
        tokens
      }
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', validateBody(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const db = req.app.locals.authDb;
    const redis = req.app.locals.redis;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production');

    // Check if refresh token exists in Redis
    try {
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token' });
      }
    } catch (redisError) {
      logger.warn('Redis not available for token verification', redisError);
    }

    // Get user
    const result = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];
    const tokens = generateTokens(user);

    // Update refresh token in Redis
    try {
      await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60);
    } catch (redisError) {
      logger.warn('Redis not available for token update', redisError);
    }

    res.json({
      success: true,
      data: { tokens }
    });
  } catch (error) {
    logger.error('Token refresh error', error);
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const redis = req.app.locals.redis;

    // Remove refresh token from Redis
    try {
      await redis.del(`refresh_token:${userId}`);
    } catch (redisError) {
      logger.warn('Redis not available for token removal', redisError);
    }

    logger.info('User logged out successfully', { userId });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = req.app.locals.authDb;

    const result = await db.query(
      'SELECT id, email, name, role, avatar, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Get current user error', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

module.exports = router;