const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const logger = require('../../shared/src/utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'gateway',
    timestamp: new Date().toISOString()
  });
});

// API Gateway routes - proxy to microservices
app.use('/api/auth', (req, res) => {
  // In production, this would proxy to the auth service
  res.json({ message: 'Auth service proxy - not implemented yet' });
});

app.use('/api/workflows', (req, res) => {
  res.json({ message: 'Workflow service proxy - not implemented yet' });
});

app.use('/api/executions', (req, res) => {
  res.json({ message: 'Execution service proxy - not implemented yet' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Gateway service running on port ${PORT}`);
});

module.exports = app;