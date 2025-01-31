import sharp from "sharp";
import path from "path";
import { getDatabase } from "./database.js";
import { toUrlFriendly } from "../utils/toUrlFriendly.js";

export class ImageService {
  constructor(storageStrategy) {
    this.storageStrategy = storageStrategy;
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
      await db.run(
        `INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          filename,
          url,
          "image/webp",
          optimizedImageBuffer.length,
          originalname,
          mimetype,
          size,
        ],
      );

      return { filename, url };
    } catch (error) {
      console.error("Error processing or uploading image:", error);
      throw new Error("Failed to process or upload image");
    }
  }

  async getOrProcessImage(key, params) {
    try {
      const buffer = await this.storageStrategy.get(key);
      return await sharp(buffer)
        .resize({
          width: params.width,
          height: params.height,
          fit: params.fit,
          withoutEnlargement: false,
        })
        .webp({ quality: params.quality })
        .toBuffer();
    } catch (error) {
      console.error("Error retrieving or processing image:", error);
      throw new Error("Failed to retrieve or process image");
    }
  }

  async deleteImage(key, userId) {
    try {
      await this.storageStrategy.delete(key);
      const db = await getDatabase();
      await db.run("DELETE FROM images WHERE filename = ? AND user_id = ?", [
        key,
        userId,
      ]);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  async listImages(limit, cursor, userId) {
    try {
      const db = await getDatabase();
      const query = `
        SELECT * FROM images
        ${userId ? "WHERE user_id = ?" : ""}
        ORDER BY id
        LIMIT ? ${cursor ? "OFFSET ?" : ""}
      `;
      const params = userId
        ? [userId, limit, cursor]
        : [limit, cursor].filter(Boolean);

      const images = await db.all(query, params);
      const nextCursor =
        images.length === limit ? limit + (cursor || 0) : undefined;

      const totalQuery = `SELECT COUNT(*) as count FROM images ${userId ? "WHERE user_id = ?" : ""}`;
      const totalParams = userId ? [userId] : [];
      const { count } = await db.get(totalQuery, totalParams);

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
}
