const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const logger = require('./logger');

class Database {
  constructor(dbPathOrInstance) {
    if (typeof dbPathOrInstance === 'string') {
      // Legacy constructor with path
      this.dbPath = dbPathOrInstance;
      this.db = null;
    } else {
      // New constructor with existing database instance
      this.db = dbPathOrInstance;
      this.dbPath = null;
    }
  }

  async connect() {
    try {
      if (this.db) {
        // Already have a database instance
        return this.db;
      }

      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      const fs = require('fs');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON');
      
      logger.info('Connected to SQLite database', { path: this.dbPath });
      return this.db;
    } catch (error) {
      logger.error('Failed to connect to SQLite database', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    const start = Date.now();
    try {
      if (!this.db) {
        await this.connect();
      }

      let result;
      if (sql.trim().toLowerCase().startsWith('select')) {
        result = {
          rows: await this.db.all(sql, params),
          rowCount: 0
        };
        result.rowCount = result.rows.length;
      } else {
        const runResult = await this.db.run(sql, params);
        result = {
          rows: runResult.lastID ? [{ id: runResult.lastID }] : [],
          rowCount: runResult.changes || 0
        };
      }

      const duration = Date.now() - start;
      logger.debug('Executed query', { sql, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query error', { sql, error });
      throw error;
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

module.exports = { Database };