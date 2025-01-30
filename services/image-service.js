import sharp from "sharp";
import path from "path";
import { toUrlFriendly } from "../utils/toUrlFriendly.js";

export class ImageService {
  constructor(storageStrategy) {
    this.storageStrategy = storageStrategy;
  }

  async processAndUploadImage(file) {
    const { originalname, buffer } = file;
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

  async deleteImage(key) {
    try {
      await this.storageStrategy.delete(key);
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      throw error;
    }
  }

  async listImages() {
    try {
      return await this.storageStrategy.list();
    } catch (error) {
      console.error("Error al listar las imágenes:", error);
      throw error;
    }
  }
}
