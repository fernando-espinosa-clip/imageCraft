import { cacheService } from "../services/cache-service.js";

export class ImageController {
  constructor(imageService) {
    this.imageService = imageService;

    // Asignar métodos como arrow functions
    this.upload = this.upload.bind(this);
    this.getImage = this.getImage.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.listImages = this.listImages.bind(this);
  }

  upload = async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .send("No se han subido imágenes o los archivos no son válidos.");
    }

    try {
      const uploadPromises = req.files.map((file) =>
        this.imageService.processAndUploadImage(file, req.user.userId),
      );
      const results = await Promise.all(uploadPromises);

      res.json({
        message: "Imágenes procesadas y subidas exitosamente",
        images: results,
      });
    } catch (error) {
      console.error("Error al procesar o subir las imágenes:", error);
      res.status(500).send("Error al procesar o subir las imágenes");
    }
  };

  getImage = async (req, res) => {
    const { key } = req.params;
    const scale = Number.parseInt(req.query.scale) || 1;
    const width = req.query.width ? Number.parseInt(req.query.width) : null;
    const height = req.query.height ? Number.parseInt(req.query.height) : null;
    const fit = req.query.fit || "cover";
    const quality = Number.parseInt(req.query.quality) || 80;
    const maxScale = 5;

    if (scale < 1 || scale > maxScale) {
      return res.status(400).send(`La escala debe estar entre 1 y ${maxScale}`);
    }

    const validFitModes = ["cover", "contain", "fill", "inside", "outside"];
    if (!validFitModes.includes(fit)) {
      return res
        .status(400)
        .send(
          `Modo de ajuste no válido. Opciones válidas: ${validFitModes.join(
            ", ",
          )}`,
        );
    }

    if (quality < 20 || quality > 80) {
      return res.status(400).send("La calidad debe estar entre 20 y 80");
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
        console.log("Imagen servida desde Redis");
        res.contentType("image/webp");
        return res.send(Buffer.from(cachedImage, "base64"));
      }

      console.log("Procesando nueva imagen");
      const image = await this.imageService.getOrProcessImage(key, {
        width,
        height,
        fit,
        scale,
        quality,
      });

      await cacheService.set(hash, image.toString("base64"), 3600); // Expira en 1 hora

      res.contentType("image/webp");
      res.send(image);
    } catch (error) {
      console.error("Error al obtener o procesar la imagen:", error);
      res.status(500).send("Error al obtener la imagen");
    }
  };

  deleteImage = async (req, res) => {
    const { key } = req.params;

    try {
      await this.imageService.deleteImage(key, req.user?.userId || 10);

      const keys = await cacheService.keys(`${key}-*`);
      await cacheService.del(keys);

      res.send(`Imagen ${key} y sus cachés han sido eliminados correctamente.`);
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      res.status(500).send("Error al eliminar la imagen y sus cachés");
    }
  };

  listImages = async (req, res) => {
    const limit = Number.parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    try {
      const result = await this.imageService.listImages(limit, cursor);
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
      console.error("Error al listar las imágenes:", error);
      res.status(500).send("Error al listar las imágenes");
    }
  };

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  }
}
