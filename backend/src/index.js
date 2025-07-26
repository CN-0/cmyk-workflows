require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { initializeDatabase } = require("./utils/initDatabase");
const { Database } = require("./utils/database");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const workflowRoutes = require("./routes/workflows");
const templateRoutes = require("./routes/templates");
const executionRoutes = require("./routes/executions");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://fc184d2c-806a-42cd-81a6-57e42d9f6a61-00-313n78z3nrb6e.sisko.replit.dev",
    credentials: true,
  }),
);

// Request logging middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        // Log to console for terminal visibility
        console.log(message.trim());
        // Also log through winston
        logger.info(message.trim());
      },
    },
  }),
);

// Custom request logger for better visibility
app.use((req, res, next) => {
  const start = Date.now();

  // Log incoming request
  console.log(`\n🔵 ${req.method} ${req.url}`);
  console.log(`   Headers: ${JSON.stringify(req.headers, null, 2)}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);
  }

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 400 ? "🔴" : res.statusCode >= 300 ? "🟡" : "🟢";
    console.log(
      `${statusColor} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)\n`,
    );
  });

  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/executions", executionRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize databases and start server
async function startServer() {
  try {
    // Initialize database tables and get open database instances
    const { authDb, workflowDb, executionDb } = await initializeDatabase();

    // Wrap database instances with the Database class for consistent API
    app.locals.authDb = new Database(authDb);
    app.locals.workflowDb = new Database(workflowDb);
    app.locals.executionDb = new Database(executionDb);

    // Initialize Redis (optional - gracefully handle failure)
    try {
      const { RedisClient } = require("./utils/redis");
      const redis = new RedisClient(
        process.env.REDIS_URL || "redis://localhost:6379",
      );
      app.locals.redis = redis;
      logger.info("Redis client initialized");
    } catch (redisError) {
      logger.warn(
        "Redis connection failed, continuing without Redis:",
        redisError.message,
      );
      // Create a mock redis client that does nothing
      app.locals.redis = {
        get: async () => null,
        set: async () => {},
        del: async () => {},
        exists: async () => false,
        isConnected: () => false,
      };
    }

    logger.info("Connected to all databases");

    app.listen(PORT, async () => {
      logger.info(`\n🚀 FlowForge Backend Server Started`);
      logger.info(`📍 Server running on: http://localhost:${PORT}`);
      logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 API endpoints: http://localhost:${PORT}/api/*`);
      logger.info(
        `⚡ Request logging enabled - all requests will be shown below\n`,
      );
      logger.info(`Monolithic backend running on port ${PORT}`);

      // Initialize workflow scheduler
      try {
        const WorkflowScheduler = require("./services/workflowScheduler");
        const scheduler = new WorkflowScheduler(app.locals.workflowDb, app.locals.executionDb);
        app.locals.scheduler = scheduler;
        await scheduler.start();
        logger.info('Workflow scheduler initialized');
      } catch (error) {
        logger.error('Failed to initialize scheduler', error);
      }
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  try {
    if (app.locals.authDb && app.locals.authDb.close)
      await app.locals.authDb.close();
    if (app.locals.workflowDb && app.locals.workflowDb.close)
      await app.locals.workflowDb.close();
    if (app.locals.executionDb && app.locals.executionDb.close)
      await app.locals.executionDb.close();
    if (app.locals.redis && app.locals.redis.close)
      await app.locals.redis.close();
  } catch (error) {
    logger.error("Error closing connections:", error);
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  try {
    if (app.locals.authDb && app.locals.authDb.close)
      await app.locals.authDb.close();
    if (app.locals.workflowDb && app.locals.workflowDb.close)
      await app.locals.workflowDb.close();
    if (app.locals.executionDb && app.locals.executionDb.close)
      await app.locals.executionDb.close();
    if (app.locals.redis && app.locals.redis.close)
      await app.locals.redis.close();
  } catch (error) {
    logger.error("Error closing connections:", error);
  }
  process.exit(0);
});