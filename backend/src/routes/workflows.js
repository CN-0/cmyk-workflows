const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation');
const { requireRole, authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const createWorkflowSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  definition: Joi.object({
    nodes: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      type: Joi.string().required(),
      label: Joi.string().required(),
      position: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required()
      }).required(),
      data: Joi.object().required(),
      config: Joi.object().optional()
    })).required(),
    edges: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      source: Joi.string().required(),
      target: Joi.string().required(),
      sourceHandle: Joi.string().optional(),
      targetHandle: Joi.string().optional(),
      condition: Joi.string().optional()
    })).required(),
    variables: Joi.object().optional(),
    settings: Joi.object().optional()
  }).required(),
  tags: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid('active', 'inactive', 'draft').default('draft')
});

const updateWorkflowSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  definition: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive', 'draft').optional()
});

const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'status').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive', 'draft').optional(),
  tags: Joi.string().optional()
});

const idSchema = Joi.object({
  id: Joi.string().required()
});

// Get all workflows
router.get('/', authenticateToken, validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder, search, status, tags } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;
    const db = req.app.locals.workflowDb;

    let whereClause = 'WHERE created_by = ?';
    const params = [userId];

    if (search) {
      whereClause += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ` AND status = ?`;
      params.push(status);
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM workflows ${whereClause}`,
      params
    );
    const total = countResult.rows[0].count;

    // Get workflows
    const result = await db.query(
      `SELECT id, name, description, status, tags, created_at, updated_at, version
       FROM workflows 
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const workflows = result.rows.map(workflow => ({
      ...workflow,
      tags: workflow.tags ? JSON.parse(workflow.tags) : [],
      executionCount: 0,
      successRate: 0
    }));

    res.json({
      success: true,
      data: workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get workflows error', error);
    res.status(500).json({ success: false, error: 'Failed to get workflows' });
  }
});

// Get workflow by ID
router.get('/:id', authenticateToken, validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const db = req.app.locals.workflowDb;

    const result = await db.query(
      `SELECT * FROM workflows WHERE id = ? AND created_by = ?`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const workflow = result.rows[0];
    workflow.definition = JSON.parse(workflow.definition);
    workflow.tags = workflow.tags ? JSON.parse(workflow.tags) : [];

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    logger.error('Get workflow error', error);
    res.status(500).json({ success: false, error: 'Failed to get workflow' });
  }
});

// Create workflow
router.post('/', authenticateToken, validateBody(createWorkflowSchema), async (req, res) => {
  try {
    const { name, description, definition, tags, status } = req.body;
    const userId = req.user.userId;
    const workflowId = uuidv4();
    const db = req.app.locals.workflowDb;
    const redis = req.app.locals.redis;

    const result = await db.query(
      `INSERT INTO workflows (id, name, description, status, definition, tags, created_by, created_at, updated_at, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)`,
      [workflowId, name, description, status, JSON.stringify(definition), JSON.stringify(tags), userId]
    );

    // Get the created workflow
    const workflowResult = await db.query(
      'SELECT * FROM workflows WHERE id = ?',
      [workflowId]
    );
    
    const workflow = workflowResult.rows[0];
    workflow.definition = JSON.parse(workflow.definition);
    workflow.tags = JSON.parse(workflow.tags);

    // Cache workflow definition for quick access
    try {
      await redis.set(`workflow:${workflowId}`, JSON.stringify(workflow), 3600); // 1 hour TTL
    } catch (redisError) {
      logger.warn('Redis not available for caching', redisError);
    }

    logger.info('Workflow created', { workflowId, userId, name });

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    logger.error('Create workflow error', error);
    res.status(500).json({ success: false, error: 'Failed to create workflow' });
  }
});

// Update workflow
router.put('/:id', authenticateToken, validateParams(idSchema), validateBody(updateWorkflowSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;
    const db = req.app.locals.workflowDb;
    const redis = req.app.locals.redis;

    // Check if workflow exists and user owns it
    const existingResult = await db.query(
      'SELECT version FROM workflows WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const currentVersion = existingResult.rows[0].version;

    // Build update query dynamically
    const updateFields = [];
    const params = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'definition') {
        updateFields.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else if (key === 'tags') {
        updateFields.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    });

    updateFields.push(`updated_at = datetime('now')`);
    updateFields.push(`version = ?`);
    params.push(currentVersion + 1);
    params.push(id);
    params.push(userId);

    await db.query(
      `UPDATE workflows 
       SET ${updateFields.join(', ')}
       WHERE id = ? AND created_by = ?`,
      params
    );

    // Get updated workflow
    const result = await db.query(
      'SELECT * FROM workflows WHERE id = ?',
      [id]
    );

    const workflow = result.rows[0];
    workflow.definition = JSON.parse(workflow.definition);
    workflow.tags = JSON.parse(workflow.tags);

    // Update cache
    try {
      await redis.set(`workflow:${id}`, JSON.stringify(workflow), 3600);
    } catch (redisError) {
      logger.warn('Redis not available for cache update', redisError);
    }

    logger.info('Workflow updated', { workflowId: id, userId, version: workflow.version });

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    logger.error('Update workflow error', error);
    res.status(500).json({ success: false, error: 'Failed to update workflow' });
  }
});

// Delete workflow
router.delete('/:id', authenticateToken, validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const db = req.app.locals.workflowDb;
    const redis = req.app.locals.redis;

    const result = await db.query(
      'DELETE FROM workflows WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Remove from cache
    try {
      await redis.del(`workflow:${id}`);
    } catch (redisError) {
      logger.warn('Redis not available for cache removal', redisError);
    }

    logger.info('Workflow deleted', { workflowId: id, userId });

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    logger.error('Delete workflow error', error);
    res.status(500).json({ success: false, error: 'Failed to delete workflow' });
  }
});

// Duplicate workflow
router.post('/:id/duplicate', authenticateToken, validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const db = req.app.locals.workflowDb;

    // Get original workflow
    const originalResult = await db.query(
      'SELECT * FROM workflows WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const original = originalResult.rows[0];
    const newWorkflowId = uuidv4();

    // Create duplicate
    await db.query(
      `INSERT INTO workflows (id, name, description, status, definition, tags, created_by, created_at, updated_at, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)`,
      [
        newWorkflowId,
        `${original.name} (Copy)`,
        original.description,
        'draft',
        original.definition,
        original.tags,
        userId
      ]
    );

    // Get the created workflow
    const result = await db.query(
      'SELECT * FROM workflows WHERE id = ?',
      [newWorkflowId]
    );

    const workflow = result.rows[0];
    workflow.definition = JSON.parse(workflow.definition);
    workflow.tags = JSON.parse(workflow.tags);

    logger.info('Workflow duplicated', { originalId: id, newId: newWorkflowId, userId });

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    logger.error('Duplicate workflow error', error);
    res.status(500).json({ success: false, error: 'Failed to duplicate workflow' });
  }
});

module.exports = router;