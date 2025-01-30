import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs/promises";
import path from "path";
import { enlistPermissions } from "../utils/directoryContent.js";
import config from "../config/index.js";

// Implementación de la estrategia para S3
export class S3StorageStrategy {
  constructor(region, accessKeyId, secretAccessKey, bucketName) {
    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
  }

  async upload(file, filename) {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: filename,
        Body: file,
        ContentType: "image/webp",
      },
    });

    try {
      const result = await upload.done();
      return result.Location;
    } catch (error) {
      console.error("Error uploading to S3", error);
      throw error;
    }
  }

  async get(filename) {
    const { Body } = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      }),
    );

    if (!Body) {
      throw new Error("Imagen no encontrada");
    }

    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async delete(filename) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      }),
    );
  }
}

// Implementación de la estrategia para almacenamiento local
export class LocalStorageStrategy {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  async upload(file, filename) {
    const permisos = await enlistPermissions(config.localStoragePath);
    console.log(`Permisos para ${config.localStoragePath}: ${permisos}`);
    const filePath = path.join(this.storagePath, filename);
    await fs.writeFile(filePath, file);
    return filePath;
  }

  async get(filename) {
    const filePath = path.join(this.storagePath, filename);
    return fs.readFile(filePath);
  }

  async delete(filename) {
    const filePath = path.join(this.storagePath, filename);
    await fs.unlink(filePath);
  }
}
