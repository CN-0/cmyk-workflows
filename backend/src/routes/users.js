const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const db = req.app.locals.authDb;
    const result = await db.query(
      'SELECT id, email, name, role, avatar, created_at, last_login FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Get users error', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;
    const db = req.app.locals.authDb;

    // Users can only view their own profile unless they're admin
    if (id !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const result = await db.query(
      'SELECT id, email, name, role, avatar, created_at, last_login FROM users WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Get user error', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;
    const { name, avatar } = req.body;
    const db = req.app.locals.authDb;

    // Users can only update their own profile unless they're admin
    if (id !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const result = await db.query(
      'UPDATE users SET name = ?, avatar = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [name, avatar, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get updated user
    const updatedUser = await db.query(
      'SELECT id, email, name, role, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedUser.rows[0]
    });
  } catch (error) {
    logger.error('Update user error', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.authDb;

    const result = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

module.exports = router;