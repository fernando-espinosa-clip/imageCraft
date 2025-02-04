import sharp from "sharp";
import path from "path";
import { getDatabase } from "./database.js";
import { toUrlFriendly } from "../utils/toUrlFriendly.js";
import config from "../config/index.js";

export class ImageService {
  constructor(storageStrategy) {
    this.storageStrategy = storageStrategy;
    this.dbType = config.database.type;
  }

  async processAndUploadImage(file, userId) {
    const { originalname, buffer, mimetype, size } = file;
    const filename = `${toUrlFriendly(path.parse(originalname).name)}.webp`;

    try {
      const optimizedImageBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const url = await this.storageStrategy.upload(
        optimizedImageBuffer,
        filename,
      );

      const db = await getDatabase();
      let query, params;

      if (this.dbType === "sqlite") {
        query = `
          INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        params = [
          userId,
          filename,
          url,
          "image/webp",
          optimizedImageBuffer.length,
          originalname,
          mimetype,
          size,
        ];
      } else if (this.dbType === "postgresql") {
        query = `
          INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        params = [
          userId,
          filename,
          url,
          "image/webp",
          optimizedImageBuffer.length,
          originalname,
          mimetype,
          size,
        ];
      } else {
        throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      await db.query(query, params);

      return { filename, url };
    } catch (error) {
      console.error("Error processing or uploading image:", error);
      throw new Error("Failed to process or upload image");
    }
  }

  async deleteImage(key, userId) {
    try {
      await this.storageStrategy.delete(key);
      const db = await getDatabase();
      let query, params;

      if (this.dbType === "sqlite") {
        query = "DELETE FROM images WHERE filename = ? AND user_id = ?";
        params = [key, userId];
      } else if (this.dbType === "postgresql") {
        query = "DELETE FROM images WHERE filename = $1 AND user_id = $2";
        params = [key, userId];
      } else {
        throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      await db.query(query, params);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  async listImages(limit, cursor, userId) {
    try {
      const db = await getDatabase();
      let query, countQuery, params, countParams;

      if (this.dbType === "sqlite") {
        query = `
          SELECT * FROM images
          ${userId ? "WHERE user_id = ?" : ""}
          ORDER BY id
          LIMIT ? ${cursor ? "OFFSET ?" : ""}
        `;
        countQuery = `SELECT COUNT(*) as count FROM images ${userId ? "WHERE user_id = ?" : ""}`;
        params = userId
          ? [userId, limit, cursor]
          : [limit, cursor].filter(Boolean);
        countParams = userId ? [userId] : [];
      } else if (this.dbType === "postgresql") {
        query = `
          SELECT * FROM images
          ${userId ? "WHERE user_id = $1" : ""}
          ORDER BY id
          LIMIT $${userId ? "2" : "1"} ${cursor ? `OFFSET $${userId ? "3" : "2"}` : ""}
        `;
        countQuery = `SELECT COUNT(*) as count FROM images ${userId ? "WHERE user_id = $1" : ""}`;
        params = userId
          ? [userId, limit, cursor]
          : [limit, cursor].filter(Boolean);
        countParams = userId ? [userId] : [];
      } else {
        throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      const images = await db.query(query, params);
      const nextCursor =
        images.length === limit ? limit + (cursor || 0) : undefined;

      const [{ count }] = await db.query(countQuery, countParams);

      return {
        images: images.map((img) => ({
          ...img,
          key: img.filename,
          lastModified: new Date(img.upload_date),
          size: img.size,
        })),
        nextCursor,
        total: count,
      };
    } catch (error) {
      console.error("Error listing images:", error);
      throw new Error("Failed to list images");
    }
  }

  // El método getOrProcessImage no necesita cambios ya que no interactúa con la base de datos
}
