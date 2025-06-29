import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { validateBody, validateQuery, validateParams } from '@flowforge/shared/src/middleware/validation';
import { requireRole, AuthenticatedRequest } from '@flowforge/shared/src/middleware/auth';
import { db, redis } from '../index';
import logger from '@flowforge/shared/src/utils/logger';

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
    settings: Joi.object({
      timeout: Joi.number().min(1).optional(),
      retryPolicy: Joi.object({
        maxAttempts: Joi.number().min(1).max(10).required(),
        backoffStrategy: Joi.string().valid('fixed', 'exponential', 'linear').required(),
        initialDelay: Joi.number().min(100).required(),
        maxDelay: Joi.number().min(1000).optional(),
        retryOn: Joi.array().items(Joi.string()).optional()
      }).optional(),
      errorHandling: Joi.object({
        strategy: Joi.string().valid('fail', 'continue', 'retry').required(),
        fallbackNode: Joi.string().optional(),
        notifyOnError: Joi.boolean().optional()
      }).optional(),
      concurrency: Joi.number().min(1).max(100).optional()
    }).optional()
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
router.get('/', validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder, search, status, tags } = req.query as any;
    const offset = (page - 1) * limit;
    const userId = req.user!.userId;

    let whereClause = 'WHERE created_by = ?';
    const params: any[] = [userId];

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
router.get('/:id', validateParams(idSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

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
router.post('/', validateBody(createWorkflowSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, definition, tags, status } = req.body;
    const userId = req.user!.userId;
    const workflowId = uuidv4();

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
    await redis.set(`workflow:${workflowId}`, JSON.stringify(workflow), 3600); // 1 hour TTL

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
router.put('/:id', validateParams(idSchema), validateBody(updateWorkflowSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updates = req.body;

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
    let paramIndex = 1;

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
    await redis.set(`workflow:${id}`, JSON.stringify(workflow), 3600);

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
router.delete('/:id', validateParams(idSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await db.query(
      'DELETE FROM workflows WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Remove from cache
    await redis.del(`workflow:${id}`);

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
router.post('/:id/duplicate', validateParams(idSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

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

export default router;