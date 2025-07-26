const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

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
router.get('/', authenticateToken, validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const offset = (page - 1) * limit;
    const db = req.app.locals.executionDb;

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
    const total = countResult.rows[0].count;

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
      data: result.rows,
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
router.get('/:id', authenticateToken, validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.executionDb;

    const result = await db.query(
      'SELECT * FROM workflow_executions WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Execution not found' });
    }

    const execution = result.rows[0];

    // Get logs
    const logsResult = await db.query(
      'SELECT * FROM execution_logs WHERE execution_id = ? ORDER BY timestamp ASC',
      [id]
    );

    execution.logs = logsResult.rows;

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
router.post('/', authenticateToken, validateBody(triggerWorkflowSchema), async (req, res) => {
  try {
    const { workflowId, triggerData } = req.body;
    const userId = req.user.userId;
    const executionDb = req.app.locals.executionDb;
    const workflowDb = req.app.locals.workflowDb;

    // Use the workflow executor
    const WorkflowExecutor = require('../services/workflowExecutor');
    const executor = new WorkflowExecutor(executionDb, workflowDb);

    const result = await executor.executeWorkflow(workflowId, triggerData || {}, userId);

    logger.info('Workflow executed', { workflowId, executionId: result.executionId, userId });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Trigger execution error', error);
    res.status(500).json({ success: false, error: 'Failed to trigger execution' });
  }
});

// Cancel execution
router.post('/:id/cancel', authenticateToken, validateParams(idSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.executionDb;

    await db.query(
      'UPDATE workflow_executions SET status = ?, completed_at = datetime(\'now\') WHERE id = ?',
      ['cancelled', id]
    );

    // Log cancellation
    const logId = uuidv4();
    await db.query(
      `INSERT INTO execution_logs (id, execution_id, node_id, level, message)
       VALUES (?, ?, ?, ?, ?)`,
      [logId, id, 'workflow', 'info', 'Workflow execution cancelled']
    );

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