const express = require('express');
const logger = require('../../../shared/src/utils/logger');

const router = express.Router();

// Mock templates data
const templates = [
  {
    id: 'email-marketing',
    name: 'Email Marketing Automation',
    description: 'Complete email marketing workflow with lead nurturing',
    category: 'Marketing',
    tags: ['email', 'marketing', 'automation'],
    nodes: 12,
    complexity: 'intermediate'
  },
  {
    id: 'support-routing',
    name: 'Customer Support Routing',
    description: 'Automatically route support tickets based on priority',
    category: 'Support',
    tags: ['support', 'tickets', 'routing'],
    nodes: 8,
    complexity: 'beginner'
  }
];

// Get all templates
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Get templates error', error);
    res.status(500).json({ success: false, error: 'Failed to get templates' });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Get template error', error);
    res.status(500).json({ success: false, error: 'Failed to get template' });
  }
});

module.exports = router;