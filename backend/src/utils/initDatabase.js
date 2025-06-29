const Database = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const logger = require('./logger');

async function initializeDatabase() {
  try {
    // Initialize auth database
    const authDb = await Database.open({
      filename: path.join(__dirname, '../../data/auth.db'),
      driver: sqlite3.Database
    });

    // Create users table
    await authDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for authentication
    await authDb.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    logger.info('Auth database tables initialized successfully');
    await authDb.close();

    // Initialize workflow database
    const workflowDb = await Database.open({
      filename: path.join(__dirname, '../../data/workflow.db'),
      driver: sqlite3.Database
    });

    await workflowDb.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await workflowDb.exec(`
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        category TEXT,
        is_public BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('Workflow database tables initialized successfully');
    await workflowDb.close();

    // Initialize execution database
    const executionDb = await Database.open({
      filename: path.join(__dirname, '../../data/execution.db'),
      driver: sqlite3.Database
    });

    await executionDb.exec(`
      CREATE TABLE IF NOT EXISTS executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        input_data TEXT,
        output_data TEXT,
        error_message TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (workflow_id) REFERENCES workflows (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await executionDb.exec(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        execution_id INTEGER NOT NULL,
        node_id TEXT,
        level TEXT DEFAULT 'info',
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (execution_id) REFERENCES executions (id)
      )
    `);

    logger.info('Execution database tables initialized successfully');
    await executionDb.close();

    logger.info('All database tables initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };