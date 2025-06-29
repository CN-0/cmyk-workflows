import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';
import logger from './logger';

export class Database {
  private db: SqliteDatabase | null = null;

  constructor(private databasePath: string) {}

  async connect() {
    if (this.db) return this.db;

    try {
      this.db = await open({
        filename: this.databasePath,
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON');
      
      logger.info('Connected to SQLite database', { path: this.databasePath });
      return this.db;
    } catch (error) {
      logger.error('Failed to connect to SQLite database', error);
      throw error;
    }
  }

  async query(sql: string, params?: any[]) {
    const start = Date.now();
    try {
      if (!this.db) {
        await this.connect();
      }

      let result;
      if (sql.trim().toLowerCase().startsWith('select')) {
        result = {
          rows: await this.db!.all(sql, params),
          rowCount: 0
        };
        result.rowCount = result.rows.length;
      } else {
        const runResult = await this.db!.run(sql, params);
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

  async migrate(migrations: string[]) {
    try {
      if (!this.db) {
        await this.connect();
      }

      // Create migrations table if it doesn't exist
      await this.db!.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      for (const migration of migrations) {
        const migrationName = migration.split('/').pop()?.replace('.sql', '') || migration;
        
        // Check if migration already executed
        const existing = await this.db!.get(
          'SELECT name FROM migrations WHERE name = ?',
          [migrationName]
        );

        if (!existing) {
          logger.info('Running migration', { migration: migrationName });
          
          // Read and execute migration file
          const fs = await import('fs/promises');
          const migrationSql = await fs.readFile(migration, 'utf8');
          
          await this.db!.exec(migrationSql);
          
          // Record migration
          await this.db!.run(
            'INSERT INTO migrations (name) VALUES (?)',
            [migrationName]
          );
          
          logger.info('Migration completed', { migration: migrationName });
        }
      }
    } catch (error) {
      logger.error('Migration failed', error);
      throw error;
    }
  }
}