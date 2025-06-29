const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

async function initializeDatabase() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info('Created data directory');
    }

    // Initialize auth database
    const authDbPath = path.join(dataDir, 'auth.db');
    const authDb = await open({
      filename: authDbPath,
      driver: sqlite3.Database
    });

    // Enable foreign key constraints and WAL mode for better concurrency
    await authDb.exec('PRAGMA foreign_keys = ON');
    await authDb.exec('PRAGMA journal_mode = WAL');

    // Create users table
    await authDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
        avatar TEXT,
        email_verified INTEGER DEFAULT 0,
        two_factor_enabled INTEGER DEFAULT 0,
        two_factor_secret TEXT,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await authDb.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await authDb.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    // Create password reset tokens table
    await authDb.exec(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Check if admin user exists, if not create one
    const adminExists = await authDb.get('SELECT id FROM users WHERE email = ?', ['admin@flowforge.com']);
    if (!adminExists) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await authDb.run(
        `INSERT INTO users (id, email, password, name, role, email_verified, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [adminId, 'admin@flowforge.com', hashedPassword, 'Admin User', 'admin', 1]
      );
      
      logger.info('Created default admin user: admin@flowforge.com / admin123');
    }

    logger.info('Auth database initialized successfully');

    // Initialize workflow database
    const workflowDbPath = path.join(dataDir, 'workflow.db');
    const workflowDb = await open({
      filename: workflowDbPath,
      driver: sqlite3.Database
    });

    await workflowDb.exec('PRAGMA foreign_keys = ON');
    await workflowDb.exec('PRAGMA journal_mode = WAL');

    // Create workflows table
    await workflowDb.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
        definition TEXT NOT NULL,
        tags TEXT,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1
      )
    `);

    // Create indexes
    await workflowDb.exec('CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by)');
    await workflowDb.exec('CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status)');

    logger.info('Workflow database initialized successfully');

    // Initialize execution database
    const executionDbPath = path.join(dataDir, 'execution.db');
    const executionDb = await open({
      filename: executionDbPath,
      driver: sqlite3.Database
    });

    await executionDb.exec('PRAGMA foreign_keys = ON');
    await executionDb.exec('PRAGMA journal_mode = WAL');

    // Create workflow executions table
    await executionDb.exec(`
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        workflow_version INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        triggered_by TEXT NOT NULL,
        trigger_data TEXT,
        context TEXT DEFAULT '{}',
        current_node TEXT,
        error TEXT,
        metrics TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create execution logs table
    await executionDb.exec(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        node_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error')),
        message TEXT NOT NULL,
        data TEXT,
        duration INTEGER,
        FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await executionDb.exec('CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id)');
    await executionDb.exec('CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status)');
    await executionDb.exec('CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_id ON execution_logs(execution_id)');

    logger.info('Execution database initialized successfully');
    logger.info('All databases initialized successfully');

    // Return the open database instances
    return {
      authDb,
      workflowDb,
      executionDb
    };
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };