const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const logger = require('./logger');

async function initializeDatabase() {
  try {
    // Initialize auth database
    const authDb = await open({
      filename: path.join(__dirname, '../../data/auth.db'),
      driver: sqlite3.Database
    });

    // Enable foreign key constraints
    await authDb.exec('PRAGMA foreign_keys = ON');

    // Begin transaction for auth database
    await authDb.exec('BEGIN TRANSACTION');

    // Create users table with UUID support and required columns
    await authDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'editor',
        avatar TEXT,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for authentication with TEXT user_id
    await authDb.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Commit transaction for auth database
    await authDb.exec('COMMIT');

    logger.info('Auth database tables initialized successfully');

    // Initialize workflow database
    const workflowDb = await open({
      filename: path.join(__dirname, '../../data/workflow.db'),
      driver: sqlite3.Database
    });

    // Enable foreign key constraints
    await workflowDb.exec('PRAGMA foreign_keys = ON');

    // Begin transaction for workflow database
    await workflowDb.exec('BEGIN TRANSACTION');

    // Create workflows table with UUID support and required columns
    await workflowDb.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        created_by TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        version INTEGER DEFAULT 1,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create workflow templates table
    await workflowDb.exec(`
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        category TEXT,
        is_public BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Commit transaction for workflow database
    await workflowDb.exec('COMMIT');

    logger.info('Workflow database tables initialized successfully');

    // Initialize execution database
    const executionDb = await open({
      filename: path.join(__dirname, '../../data/execution.db'),
      driver: sqlite3.Database
    });

    // Enable foreign key constraints
    await executionDb.exec('PRAGMA foreign_keys = ON');

    // Begin transaction for execution database
    await executionDb.exec('BEGIN TRANSACTION');

    // Create workflow_executions table (renamed from executions) with UUID support
    await executionDb.exec(`
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        workflow_version INTEGER NOT NULL,
        triggered_by TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
        input_data TEXT,
        output_data TEXT,
        trigger_data TEXT,
        context TEXT DEFAULT '{}',
        metrics TEXT DEFAULT '{}',
        error_message TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    // Create execution_logs table with UUID support and additional columns
    await executionDb.exec(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        node_id TEXT,
        level TEXT DEFAULT 'info',
        message TEXT NOT NULL,
        data TEXT,
        duration INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Commit transaction for execution database
    await executionDb.exec('COMMIT');

    logger.info('Execution database tables initialized successfully');

    logger.info('All database tables initialized successfully');

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