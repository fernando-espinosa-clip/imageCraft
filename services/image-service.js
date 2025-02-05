import sharp from "sharp";
import path from "path";
import { getDatabase } from "./database.js";
import { toUrlFriendly } from "../utils/toUrlFriendly.js";
import { getQueries } from "../queries/queryFactory.js";

export class ImageService {
  constructor(storageStrategy) {
    this.storageStrategy = storageStrategy;
    this.queries = getQueries();
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
      const params = [
        userId,
        filename,
        url,
        "image/webp",
        optimizedImageBuffer.length,
        originalname,
        mimetype,
        size,
      ];

      await db.query(this.queries.upsertImage, params);

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
      await db.query(this.queries.deleteImage, [key, userId]);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  async listImages(limit, cursor, userId) {
    try {
      const db = await getDatabase();
      const offset = cursor || 0;

      let images, count;
      if (userId) {
        images = await db.query(this.queries.listImagesByUser, [
          userId,
          limit,
          offset,
        ]);
        [{ count }] = await db.query(this.queries.countImagesByUser, [userId]);
      } else {
        images = await db.query(this.queries.listAllImages, [limit, offset]);
        [{ count }] = await db.query(this.queries.countAllImages);
      }

      const nextCursor = images.length === limit ? offset + limit : undefined;

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
