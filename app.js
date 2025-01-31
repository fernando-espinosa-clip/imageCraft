import express from "express";
import config from "./config/index.js";
import {
  S3StorageStrategy,
  LocalStorageStrategy,
} from "./services/storage-strategies.js";
import { ImageService } from "./services/image-service.js";
import { ImageController } from "./controllers/image-controller.js";
import { cacheService } from "./services/cache-service.js";
import authRoutes from "./routes/auth-routes.js";
import { createImageRouter } from "./routes/image-routes.js";
import globalErrorHandling from "./middleware/globalErrorHandling.js";
import corsMiddleware from "./middleware/cors.js";
import { createDir } from "./utils/directoryContent.js";
import { initializeDatabase } from "./services/database.js";

const app = express();

// Middleware de CORS
app.use(corsMiddleware);

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la estrategia de almacenamiento
let storageStrategy;
if (config.storageType === "s3") {
  storageStrategy = new S3StorageStrategy(
    config.s3.region,
    config.s3.accessKeyId,
    config.s3.secretAccessKey,
    config.s3.bucketName,
  );
} else {
  storageStrategy = new LocalStorageStrategy(config.localStoragePath);
  createDir(config.localStoragePath, "0755");
}

const imageService = new ImageService(storageStrategy);

const imageController = new ImageController(imageService);

// Rutas
app.use("/auth", authRoutes);
app.use("/images", createImageRouter(imageController));

// Iniciar el servidor
const startServer = async () => {
  try {
    await initializeDatabase();
    await cacheService.connect();
    app.listen(config.port, () => {
      console.log(`Servidor corriendo en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

app.use(globalErrorHandling);

// Ejemplo de uso
(async () => {
  try {
    await startServer();
  } catch (error) {
    console.error(error.message);
  }
})();
