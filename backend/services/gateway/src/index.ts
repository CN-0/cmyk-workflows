import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import logger from '@flowforge/shared/src/utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Service proxies
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  workflow: process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3002',
  execution: process.env.EXECUTION_SERVICE_URL || 'http://localhost:3003'
};

// Auth service proxy
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  },
  onError: (err, req, res) => {
    logger.error('Auth service proxy error', err);
    res.status(503).json({ success: false, error: 'Auth service unavailable' });
  }
}));

// Workflow service proxy
app.use('/api/workflows', createProxyMiddleware({
  target: services.workflow,
  changeOrigin: true,
  pathRewrite: {
    '^/api/workflows': '/workflows'
  },
  onError: (err, req, res) => {
    logger.error('Workflow service proxy error', err);
    res.status(503).json({ success: false, error: 'Workflow service unavailable' });
  }
}));

// Execution service proxy
app.use('/api/executions', createProxyMiddleware({
  target: services.execution,
  changeOrigin: true,
  pathRewrite: {
    '^/api/executions': '/executions'
  },
  onError: (err, req, res) => {
    logger.error('Execution service proxy error', err);
    res.status(503).json({ success: false, error: 'Execution service unavailable' });
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Service endpoints:', services);
});

export default app;