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
    const filename = `${toUrlFriendly(
      path.basename(originalname, path.extname(originalname)),
    )}.webp`;

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
      console.error("Error al procesar o subir la imagen:", error);
      throw error;
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
      console.error("Error al obtener o procesar la imagen:", error);
      throw error;
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
      console.error("Error al eliminar la imagen:", error);
      throw error;
    }
  }

  async listImages(limit, cursor, userId) {
    try {
      const db = await getDatabase();
      let query = "SELECT * FROM images";
      const params = [];

      if (userId) {
        query += " WHERE user_id = ?";
        params.push(userId);
      }

      query += " LIMIT ?" + (cursor ? " OFFSET ?" : "");
      params.push(limit);
      if (cursor) params.push(cursor);

      const images = await db.all(query, params);

      const nextCursor =
        images.length === limit ? limit + (cursor ? +cursor : 0) : undefined;

      return {
        images: images.map((img) => ({
          ...img,
          key: img.filename,
          lastModified: new Date(img.upload_date),
          size: img.size,
        })),
        nextCursor,
        total: await db
          .get(
            "SELECT COUNT(*) as count FROM images" +
              (userId ? " WHERE user_id = ?" : ""),
            userId ? [userId] : [],
          )
          .then((result) => result.count),
      };
    } catch (error) {
      console.error("Error al listar las imágenes:", error);
      throw error;
    }
  }
}
