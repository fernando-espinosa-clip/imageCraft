import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
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
  apiKeys: {
    user1: process.env.API_KEY_USER_1,
    user2: process.env.API_KEY_USER_2,
  },
  users: [
    {
      id: 1,
      apiKey: process.env.API_KEY_USER_1,
      permissions: ["upload", "delete", "list"],
    },
    {
      id: 2,
      apiKey: process.env.API_KEY_USER_2,
      permissions: ["upload", "list"],
    },
  ],
};
