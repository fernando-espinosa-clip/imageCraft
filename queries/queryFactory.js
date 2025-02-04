import { sqliteQueries } from "./sqliteQueries.js";
import { postgresQueries } from "./postgresQueries.js";
import config from "../config/index.js";

export function getQueries() {
  switch (config.database.type) {
    case "sqlite":
      return sqliteQueries;
    case "postgresql":
      return postgresQueries;
    default:
      throw new Error(`Unsupported database type: ${config.database.type}`);
  }
}
