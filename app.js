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
import { initializeDatabase, closeDatabase } from "./services/database.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

const storageStrategy =
  config.storageType === "s3"
    ? new S3StorageStrategy(
        config.s3.region,
        config.s3.accessKeyId,
        config.s3.secretAccessKey,
        config.s3.bucketName,
      )
    : new LocalStorageStrategy(config.localStoragePath);

if (config.storageType !== "s3") {
  createDir(config.localStoragePath, "0755");
}

const imageService = new ImageService(storageStrategy);
const imageController = new ImageController(imageService);

app.use("/auth", authRoutes);
app.use("/images", createImageRouter(imageController));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.use(globalErrorHandling);

const startServer = async () => {
  try {
    await initializeDatabase();
    await cacheService.connect();
    app.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await closeDatabase();
  process.exit(0);
});

export default app;
