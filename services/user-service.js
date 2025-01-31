import { getDatabase } from "./database.js";
import { generateToken } from "../utils/jwt.js";

export class UserService {
  async createUser(user) {
    const db = await getDatabase();
    const result = await db.run(
      `INSERT INTO users (first_name, last_name, email, apikey, username, file_permissions)
         VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.first_name,
        user.last_name,
        user.email,
        user.apikey,
        user.username,
        JSON.stringify(user.file_permissions),
      ],
    );
    return { ...user, id: result.lastID };
  }

  async getUserByApiKey(apiKey) {
    const db = await getDatabase();
    const user = await db.get("SELECT * FROM users WHERE apikey = ?", apiKey);
    return user
      ? { ...user, file_permissions: JSON.parse(user.file_permissions) }
      : null;
  }

  async getUserById(id) {
    const db = await getDatabase();
    const user = await db.get("SELECT * FROM users WHERE id = ?", id);
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
