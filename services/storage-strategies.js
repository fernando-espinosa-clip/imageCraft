import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs/promises";
import path from "path";

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

  async list(limit, cursor) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      MaxKeys: limit,
      ContinuationToken: cursor,
    });

    try {
      const data = await this.s3Client.send(command);
      console.log(data);
      const images = data.Contents.map((object) => {
        return {
          key: object.Key,
          lastModified: object.LastModified,
          size: object.Size,
        };
      });
      return {
        images,
        nextCursor: data.NextContinuationToken,
      };
    } catch (error) {
      console.error("Error listing objects from S3", error);
      throw error;
    }
  }
}

// Implementación de la estrategia para almacenamiento local
export class LocalStorageStrategy {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  async upload(file, filename) {
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

  async list(limit, cursor) {
    try {
      const files = await fs.readdir(this.storagePath);
      const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      });

      const startIndex = cursor ? imageFiles.indexOf(cursor) + 1 : 0;
      const paginatedFiles = imageFiles.slice(startIndex, startIndex + limit);

      const images = await Promise.all(
        paginatedFiles.map(async (file) => {
          const filePath = path.join(this.storagePath, file);
          const stats = await fs.stat(filePath);
          return {
            key: file,
            lastModified: stats.mtime,
            size: stats.size,
          };
        }),
      );

      return {
        images,
        nextCursor:
          paginatedFiles.length === limit
            ? paginatedFiles[paginatedFiles.length - 1]
            : undefined,
        total: imageFiles.length,
      };
    } catch (error) {
      console.error("Error listing files from local storage", error);
      throw error;
    }
  }
}
