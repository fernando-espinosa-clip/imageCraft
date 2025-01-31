/* eslint-disable no-unused-vars */

import sqlite3 from "sqlite3";
import { open } from "sqlite";

export class DatabaseStrategy {
  async connect() {
    throw new Error("connect method must be implemented");
  }

  async disconnect() {
    throw new Error("disconnect method must be implemented");
  }

  async query(sql, params) {
    throw new Error("query method must be implemented");
  }

  async initializeTables() {
    throw new Error("initializeTables method must be implemented");
  }

  async transaction(callback) {
    throw new Error("transaction method must be implemented");
  }
}

export class SQLiteStrategy extends DatabaseStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  async connect() {
    try {
      this.db = await open({
        filename: this.config.filename,
        driver: sqlite3.Database,
      });
      console.log("SQLite database connected successfully");
    } catch (error) {
      console.error("Error connecting to SQLite database:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.db) {
      await this.db.close();
      console.log("SQLite database disconnected successfully");
    }
  }

  async query(sql, params) {
    return this.db.all(sql, params);
  }

  async initializeTables() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         first_name TEXT,
                                         last_name TEXT,
                                         email TEXT UNIQUE,
                                         apikey TEXT UNIQUE,
                                         username TEXT UNIQUE,
                                         file_permissions TEXT,
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS images (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          user_id INTEGER NOT NULL,
                                          filename TEXT NOT NULL,
                                          path TEXT NOT NULL,
                                          file_type TEXT,
                                          size INTEGER,
                                          original_filename TEXT,
                                          original_file_type TEXT,
                                          original_size INTEGER,
                                          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          tags TEXT,
                                          metadata TEXT,
                                          FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TRIGGER IF NOT EXISTS update_users_updated_at
        AFTER UPDATE ON users
                FOR EACH ROW
      BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);
    console.log("SQLite tables initialized successfully");
  }

  async transaction(callback) {
    return this.db.transaction(callback);
  }
}

export class PostgreSQLStrategy extends DatabaseStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  async connect() {
    const { Pool } = await import("pg");
    this.pool = new Pool(this.config);
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query(sql, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async initializeTables() {
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
                                         id SERIAL PRIMARY KEY,
                                         first_name VARCHAR(50),
                                         last_name VARCHAR(50),
                                         email VARCHAR(100) UNIQUE,
                                         apikey VARCHAR(50) UNIQUE,
                                         username VARCHAR(100) UNIQUE,
                                         file_permissions VARCHAR(100),
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS images (
                                          id SERIAL PRIMARY KEY,
                                          user_id INT NOT NULL,
                                          filename VARCHAR(255) NOT NULL,
                                          path VARCHAR(500) NOT NULL,
                                          file_type VARCHAR(100),
                                          size INT,
                                          original_filename VARCHAR(255),
                                          original_file_type VARCHAR(100),
                                          original_size INT,
                                          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          tags TEXT[],
                                          metadata JSONB,
                                          CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
