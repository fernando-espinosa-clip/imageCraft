import { getDatabase } from "./database.js";
import { generateToken } from "../utils/jwt.js";
import { getQueries } from "../queries/queryFactory.js";

import stringValues2Array from "../utils/stringValues2Array.js";

export class UserService {
  constructor() {
    this.queries = getQueries();
  }

  async createUser(user) {
    const db = await getDatabase();
    const params = [
      user.first_name,
      user.last_name,
      user.email,
      user.apikey,
      user.username,
      JSON.stringify(user.file_permissions),
    ];

    const result = await db.query(this.queries.insertUser, params);
    return { ...user, id: result.insertId || result[0]?.id };
  }

  async getUserByApiKey(apiKey) {
    const db = await getDatabase();
    const [user] = await db.query(this.queries.getUserByApiKey, [apiKey]);
    return user
      ? {
          ...user,
          file_permissions: stringValues2Array(user.file_permissions),
        }
      : null;
  }

  async getUserById(id) {
    const db = await getDatabase();
    const [user] = await db.query(this.queries.getUserById, [id]);
    return user
      ? {
          ...user,
          file_permissions: stringValues2Array(user.file_permissions),
        }
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
