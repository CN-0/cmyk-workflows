import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { validateBody } from '@flowforge/shared/src/middleware/validation';
import { authenticateToken } from '@flowforge/shared/src/middleware/auth';
import { db, redis } from '../index';
import logger from '@flowforge/shared/src/utils/logger';

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
const generateTokens = (user: any) => {
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
    await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60); // 7 days

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
    await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60);

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

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production') as any;

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
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
    await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60);

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
    const userId = (req as any).user.userId;

    // Remove refresh token from Redis
    await redis.del(`refresh_token:${userId}`);

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
    const userId = (req as any).user.userId;

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

export default router;