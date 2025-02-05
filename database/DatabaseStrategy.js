/* eslint-disable no-unused-vars */
import pg from "pg";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seeder.js";
import { getQueries } from "../queries/queryFactory.js";
import { createSQLiteTables } from "../queries/sqliteTables.js";
import { createPostgresTables } from "../queries/postgresTables.js";

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

  async seed() {
    const queries = getQueries();
    try {
      const [result] = await this.query(queries.countUsers);
      const userCount = +result.count;

      if (userCount === 0) {
        await seedUsers(this);
      } else {
        console.log("Users table already has data. Skipping seeding.");
      }
    } catch (error) {
      console.error("Error checking or seeding users:", error);
    }
  }

  async tableExists(tableName) {
    throw new Error("tableExists method must be implemented");
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
    await this.db.exec(createSQLiteTables);
    console.log("SQLite tables initialized successfully");
  }

  async transaction(callback) {
    return this.db.transaction(callback);
  }

  async tableExists(tableName) {
    const result = await this.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
    );
    return result.length > 0;
  }
}

export class PostgreSQLStrategy extends DatabaseStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  async connect() {
    this.pool = new pg.Pool({
      ...this.config,
      ssl: {
        rejectUnauthorized: false, // Permite conexiones sin verificar el certificado (útil en desarrollo)
      },
    });
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
    await this.query(createPostgresTables);
    console.log("PostgreSQL tables initialized successfully");
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

  async tableExists(tableName) {
    const result = await this.query(
      "SELECT to_regclass($1) IS NOT NULL AS exists",
      [tableName],
    );
    return result[0].exists;
  }
}
