const fs = require('fs');
const path = require('path');
const { Database } = require('../services/shared/src/utils/database');

async function runMigrations() {
  console.log('🔄 Running SQLite migrations...');

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory');
  }

  // Initialize databases
  const authDb = new Database(path.join(dataDir, 'auth.db'));
  const workflowDb = new Database(path.join(dataDir, 'workflow.db'));
  const executionDb = new Database(path.join(dataDir, 'execution.db'));

  try {
    // Connect to databases
    await authDb.connect();
    await workflowDb.connect();
    await executionDb.connect();

    console.log('📊 Connected to SQLite databases');

    // Auth database migrations
    console.log('🔐 Setting up auth database...');
    await authDb.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
        avatar TEXT,
        email_verified INTEGER DEFAULT 0,
        two_factor_enabled INTEGER DEFAULT 0,
        two_factor_secret TEXT,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await authDb.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await authDb.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    await authDb.query(`
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

    // Workflow database migrations
    console.log('⚡ Setting up workflow database...');
    await workflowDb.query(`
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

    await workflowDb.query('CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by)');
    await workflowDb.query('CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status)');

    // Execution database migrations
    console.log('🚀 Setting up execution database...');
    await executionDb.query(`
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

    await executionDb.query(`
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

    await executionDb.query('CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id)');
    await executionDb.query('CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status)');
    await executionDb.query('CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_id ON execution_logs(execution_id)');

    console.log('✅ All migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await authDb.close();
    await workflowDb.close();
    await executionDb.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };