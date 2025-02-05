import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || "24h", // Nuevo parámetro
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  storageType: process.env.STORAGE_TYPE || "local",
  localStoragePath: process.env.LOCAL_STORAGE_PATH || "./uploads",
  corsWhitelist: process.env.CORS_WHITELIST,
  s3: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
  },
  database: {
    type: process.env.DB_TYPE || "sqlite",
    sqlite: {
      filename:
        process.env.SQLITE_FILENAME ||
        path.join(__dirname, "..", "..", "database.sqlite"),
    },
    postgresql: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    },
  },
};
