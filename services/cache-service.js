import { createClient } from "redis";
import config from "../config/index.js";
import crypto from "crypto";

class CacheService {
  constructor() {
    this.client = createClient({
      url: config.redisUrl,
    });

    this.client.on("error", (err) => console.log("Redis Client Error", err));
  }

  async connect() {
    await this.client.connect();
  }

  async get(key) {
    return this.client.get(key);
  }

  async set(key, value, expirationInSeconds) {
    await this.client.set(key, value, {
      EX: expirationInSeconds,
    });
  }

  async del(keys) {
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async keys(pattern) {
    return this.client.keys(pattern);
  }

  generateImageHash(key, params) {
    const hashString = `${key}-${params.width}-${params.height}-${params.fit}-${params.scale}-${params.quality}`;
    return crypto.createHash("md5").update(hashString).digest("hex");
  }
}

export const cacheService = new CacheService();
