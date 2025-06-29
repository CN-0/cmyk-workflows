const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { validateBody, validateQuery, validateParams } = require('../../../shared/src/middleware/validation');
const logger = require('../../../shared/src/utils/logger');

const router = express.Router();

// Validation schemas
const triggerWorkflowSchema = Joi.object({
  workflowId: Joi.string().required(),
  triggerData: Joi.object().optional()
});

const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'running', 'completed', 'failed', 'cancelled').optional()
});

const idSchema = Joi.object({
  id: Joi.string().required()
});

// Get all executions
router.get('/', validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const offset = (page - 1) * limit;
    const db = req.app.locals.db;

    let whereClause = '';
    const params = [];

    if (status) {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM workflow_executions ${whereClause}`,
      params
    );
    const total = countResult[0].count;

    // Get executions
    const result = await db.query(
      `SELECT * FROM workflow_executions 
       ${whereClause}
       ORDER BY started_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get executions error', error);
    res.status(500).json({ success: false, error: 'Failed to get executions' });
  }
});

// Get execution by ID
router.get('/:id', validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const workflowEngine = req.app.locals.workflowEngine;

    const execution = await workflowEngine.getExecution(id);

    if (!execution) {
      return res.status(404).json({ success: false, error: 'Execution not found' });
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    logger.error('Get execution error', error);
    res.status(500).json({ success: false, error: 'Failed to get execution' });
  }
});

// Trigger workflow execution
router.post('/', validateBody(triggerWorkflowSchema), async (req, res) => {
  try {
    const { workflowId, triggerData } = req.body;
    const userId = req.user.userId;
    const workflowEngine = req.app.locals.workflowEngine;

    const executionId = await workflowEngine.triggerWorkflow(workflowId, userId, triggerData);

    res.status(201).json({
      success: true,
      data: { executionId }
    });
  } catch (error) {
    logger.error('Trigger execution error', error);
    res.status(500).json({ success: false, error: 'Failed to trigger execution' });
  }
});

// Cancel execution
router.post('/:id/cancel', validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const workflowEngine = req.app.locals.workflowEngine;

    await workflowEngine.cancelExecution(id);

    res.json({
      success: true,
      message: 'Execution cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel execution error', error);
    res.status(500).json({ success: false, error: 'Failed to cancel execution' });
  }
});

module.exports = router;