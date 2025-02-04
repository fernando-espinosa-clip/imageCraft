import { DatabaseFactory } from "../database/DatabaseFactory.js";

let db = null;

export async function initializeDatabase() {
  if (!db) {
    db = DatabaseFactory.createDatabase();
    await db.connect();
    await db.initializeTables();
    await db.seed();
  }
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.disconnect();
    db = null;
  }
}

export async function transaction(callback) {
  const database = await getDatabase();
  return database.transaction(callback);
}
