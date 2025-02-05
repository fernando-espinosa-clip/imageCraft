import { cacheService } from "../services/cache-service.js";

export class ImageController {
  constructor(imageService) {
    this.imageService = imageService;
  }

  upload = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No valid images uploaded" });
    }

    try {
      const uploadPromises = req.files.map((file) =>
        this.imageService.processAndUploadImage(file, req.user.userId),
      );
      const results = await Promise.all(uploadPromises);

      res.json({
        message: "Images processed and uploaded successfully",
        images: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getImage = async (req, res, next) => {
    const { key } = req.params;
    const scale = Number(req.query.scale) || 1;
    const width = req.query.width ? Number(req.query.width) : null;
    const height = req.query.height ? Number(req.query.height) : null;
    const fit = req.query.fit || "cover";
    const quality = Number(req.query.quality) || 80;

    if (scale < 1 || scale > 5) {
      return res.status(400).json({ error: "Scale must be between 1 and 5" });
    }

    const validFitModes = ["cover", "contain", "fill", "inside", "outside"];
    if (!validFitModes.includes(fit)) {
      return res
        .status(400)
        .json({
          error: `Invalid fit mode. Valid options: ${validFitModes.join(", ")}`,
        });
    }

    if (quality < 20 || quality > 80) {
      return res
        .status(400)
        .json({ error: "Quality must be between 20 and 80" });
    }

    try {
      const hash = cacheService.generateImageHash(key, {
        width,
        height,
        fit,
        scale,
        quality,
      });
      const cachedImage = await cacheService.get(hash);

      if (cachedImage) {
        res.contentType("image/webp");
        return res.send(Buffer.from(cachedImage, "base64"));
      }

      const image = await this.imageService.getOrProcessImage(key, {
        width,
        height,
        fit,
        scale,
        quality,
      });
      await cacheService.set(hash, image.toString("base64"), 3600);

      res.contentType("image/webp");
      res.send(image);
    } catch (error) {
      next(error);
    }
  };

  deleteImage = async (req, res, next) => {
    const { key } = req.params;

    try {
      await this.imageService.deleteImage(key, req.user?.userId);
      const cacheKeys = await cacheService.keys(`${key}-*`);
      await cacheService.del(cacheKeys);

      res.json({
        message: `Image ${key} and its caches have been successfully deleted.`,
      });
    } catch (error) {
      next(error);
    }
  };

  listImages = async (req, res, next) => {
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor;

    try {
      const result = await this.imageService.listImages(
        limit,
        cursor,
        req.user?.userId,
      );
      res.json({
        images: result.images.map((img) => ({
          uri: `/images/${img.key}`,
          lastModified: img.lastModified.toISOString(),
          size: this.formatFileSize(img.size),
          originalMimetype: img.original_file_type,
          originalSize: this.formatFileSize(img.original_size),
        })),
        nextCursor: result.nextCursor,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUserImage = async (req, res, next) => {
    const { key } = req.params;
    const userId = req.user.userId;

    try {
      await this.imageService.deleteImage(key, userId);
      const cacheKeys = await cacheService.keys(`${key}-*`);
      await cacheService.del(cacheKeys);

      res.json({
        message: `Image ${key} and its caches have been successfully deleted.`,
      });
    } catch (error) {
      next(error);
    }
  };

  listUserImages = async (req, res, next) => {
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor;
    const userId = req.user.userId;

    try {
      const result = await this.imageService.listImages(limit, cursor, userId);
      res.json({
        images: result.images.map((img) => ({
          uri: `/images/${img.key}`,
          lastModified: img.lastModified.toISOString(),
          size: this.formatFileSize(img.size),
          originalMimetype: img.original_file_type,
          originalSize: this.formatFileSize(img.original_size),
        })),
        nextCursor: result.nextCursor,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  };

  formatFileSize(bytes) {
    const units = ["bytes", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  }
}
