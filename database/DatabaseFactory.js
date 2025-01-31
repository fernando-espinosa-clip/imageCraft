import { SQLiteStrategy, PostgreSQLStrategy } from "./DatabaseStrategy.js";
import config from "../config/index.js";

export class DatabaseFactory {
  static createDatabase() {
    if (config.database.type === "sqlite") {
      return new SQLiteStrategy(config.database.sqlite);
    } else if (config.database.type === "postgresql") {
      return new PostgreSQLStrategy(config.database.postgresql);
    } else {
      throw new Error("Unsupported database type");
    }
  }
}
