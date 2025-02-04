import { getDatabase } from "./database.js";
import { generateToken } from "../utils/jwt.js";
import config from "../config/index.js";

export class UserService {
  constructor() {
    this.dbType = config.database.type;
  }

  async createUser(user) {
    const db = await getDatabase();
    let query, params;

    if (this.dbType === "sqlite") {
      query = `
        INSERT INTO users (first_name, last_name, email, apikey, username, file_permissions)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      params = [
        user.first_name,
        user.last_name,
        user.email,
        user.apikey,
        user.username,
        JSON.stringify(user.file_permissions),
      ];
    } else if (this.dbType === "postgresql") {
      query = `
        INSERT INTO users (first_name, last_name, email, apikey, username, file_permissions)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      params = [
        user.first_name,
        user.last_name,
        user.email,
        user.apikey,
        user.username,
        user.file_permissions,
      ];
    } else {
      throw new Error(`Unsupported database type: ${this.dbType}`);
    }

    const result = await db.query(query, params);
    return {
      ...user,
      id: this.dbType === "sqlite" ? result.lastID : result[0].id,
    };
  }

  async getUserByApiKey(apiKey) {
    const db = await getDatabase();
    let query, params;

    if (this.dbType === "sqlite") {
      query = "SELECT * FROM users WHERE apikey = ?";
      params = [apiKey];
    } else if (this.dbType === "postgresql") {
      query = "SELECT * FROM users WHERE apikey = $1";
      params = [apiKey];
    } else {
      throw new Error(`Unsupported database type: ${this.dbType}`);
    }

    const [user] = await db.query(query, params);
    return user
      ? { ...user, file_permissions: JSON.parse(user.file_permissions) }
      : null;
  }

  async getUserById(id) {
    const db = await getDatabase();
    let query, params;

    if (this.dbType === "sqlite") {
      query = "SELECT * FROM users WHERE id = ?";
      params = [id];
    } else if (this.dbType === "postgresql") {
      query = "SELECT * FROM users WHERE id = $1";
      params = [id];
    } else {
      throw new Error(`Unsupported database type: ${this.dbType}`);
    }

    const [user] = await db.query(query, params);
    return user
      ? { ...user, file_permissions: JSON.parse(user.file_permissions) }
      : null;
  }

  async authenticateUserByApiKey(apiKey) {
    const user = await this.getUserByApiKey(apiKey);
    if (!user) return null;

    return generateToken({
      id: user.id,
      permissions: user.file_permissions,
      apiKey: user.apikey,
    });
  }
}
