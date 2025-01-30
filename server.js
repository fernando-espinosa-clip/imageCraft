import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import cors from "cors";

import { encrypt, decrypt } from "./encrypt.js";
import { toUrlFriendly } from "./utils.js";

dotenv.config();

// Lista blanca de dominios permitidos
const whitelist = process.env.CORS_WHITELIST
  ? process.env.CORS_WHITELIST.split(",")
  : ["http://localhost:5173", "http://example.com"];

// Configuración del middleware de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      // Permitir solicitudes desde dominios en la lista blanca o solicitudes sin origen (como desde Postman)
      callback(null, true);
    } else {
      // Bloquear solicitudes no autorizadas
      callback(new Error("No autorizado por política de CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  headers: "Content-Type, Authorization",
  credentials: true, // Permitir cookies/tokens en las solicitudes CORS
};

const app = express();
const port = process.env.PORT || 3000;

// Middleware de CORS
app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Configuración de Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// Conectar a Redis
(async () => {
  await redisClient.connect();
})();

// Configuración de AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Función para validar tipos de archivo
function fileFilter(req, file, cb) {
  console.log("Validando tipo de archivo:", file.mimetype);
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP).",
      ),
      false,
    );
  }
}

// Configuración de Multer con validación de tipo de archivo
const upload = multer({
  storage: multer.memoryStorage(),
  fileName: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar tamaño a 5MB
  },
});

// Función para generar token JWT
function generateToken(user) {
  const api = encrypt(user.apiKey);
  return (
    jwt.sign(
      {
        userId: user.id,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET + user.apiKey,
      { expiresIn: "1h" },
    ) +
    "." +
    api
  );
}

// Middleware de autenticación JWT con verificación de permisos y renovación de token
const authenticateJWT = (requiredPermissions) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(" ")[1].split(".");
    const token = parts.filter((part, index) => index < 3).join(".");
    const api = parts[parts.length - 1];

    jwt.verify(token, process.env.JWT_SECRET + decrypt(api), (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expirado" });
        }
        return res.sendStatus(403);
      }

      // Verificar permisos
      const hasRequiredPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission),
      );

      if (!hasRequiredPermissions) {
        return res.status(403).json({ message: "Permisos insuficientes" });
      }

      // Verificar si el token está próximo a expirar (menos de 5 minutos)
      const expirationTime = user.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration < 300000) {
        // 5 minutos en milisegundos
        // Generar un nuevo token
        const newToken = generateToken(user);
        res.setHeader("X-New-Token", newToken);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Función para subir archivo a S3
async function uploadToS3(file, filename) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
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

// Función para procesar y subir una imagen
async function processAndUploadImage(file) {
  const { originalname, buffer } = file;

  const filename = `${toUrlFriendly(
    path.basename(originalname, path.extname(originalname)),
  )}.webp`;

  try {
    const optimizedImageBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    const s3Url = await uploadToS3(optimizedImageBuffer, filename);
    return { filename, url: s3Url };
  } catch (error) {
    console.error("Error al procesar o subir la imagen:", error);
    throw error;
  }
}

// Simulación de base de datos de usuarios
const users = [
  {
    id: 1,
    apiKey: process.env.API_KEY_USER_1,
    permissions: ["upload", "delete"],
  },
  { id: 2, apiKey: process.env.API_KEY_USER_2, permissions: ["upload"] },
];

// Ruta de autenticación para generar JWT con ID de usuario y permisos
app.post("/auth", (req, res) => {
  const { apiKey } = req.body;
  const user = users.find((u) => u.apiKey === apiKey);

  if (user) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ message: "API key inválida" });
  }
});

// Nueva ruta para renovar el token
app.post("/renew-token", authenticateJWT([]), (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ token: newToken });
});

// Ruta para subir una o varias imágenes (con autenticación y verificación de permisos)
app.post(
  "/upload",
  authenticateJWT(["upload"]),
  upload.array("files", 10),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .send("No se han subido imágenes o los archivos no son válidos.");
    }

    try {
      const uploadPromises = req.files.map(processAndUploadImage);
      const results = await Promise.all(uploadPromises);

      res.json({
        message: "Imágenes procesadas y subidas exitosamente",
        images: results,
      });
    } catch (error) {
      console.error("Error al procesar o subir las imágenes:", error);
      res.status(500).send("Error al procesar o subir las imágenes");
    }
  },
);

// Función para generar un hash único para los parámetros de la imagen
function generateImageHash(key, params) {
  const hashString = `${key}-${params.width}-${params.height}-${params.fit}-${params.scale}-${params.quality}`;
  return crypto.createHash("md5").update(hashString).digest("hex");
}

// Función para obtener la imagen del caché o procesarla
async function getOrProcessImage(key, params) {
  const hash = generateImageHash(key, params);

  try {
    // Intentar obtener la imagen de Redis
    const cachedImage = await redisClient.get(hash);
    if (cachedImage) {
      console.log("Imagen servida desde Redis");
      return Buffer.from(cachedImage, "base64");
    }

    console.log("Procesando nueva imagen");
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }),
    );

    if (!Body) {
      throw new Error("Imagen no encontrada");
    }

    let chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const processedImage = await sharp(buffer)
      .resize({
        width: params.width,
        height: params.height,
        fit: params.fit,
        withoutEnlargement: false,
      })
      .webp({ quality: params.quality })
      .toBuffer();

    // Guardar la imagen procesada en Redis
    await redisClient.set(hash, processedImage.toString("base64"), {
      EX: 3600, // Expira en 1 hora
    });

    return processedImage;
  } catch (error) {
    console.error("Error al obtener o procesar la imagen:", error);
    throw error;
  }
}

// Ruta para servir imágenes dinámicamente con caché
app.get("/image/:key", async (req, res) => {
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
    const image = await getOrProcessImage(key, {
      width,
      height,
      fit,
      scale,
      quality,
    });
    res.contentType("image/webp");
    res.send(image);
  } catch (error) {
    console.error("Error al obtener o procesar la imagen:", error);
    res.status(500).send("Error al obtener la imagen");
  }
});

// Ruta para borrar una imagen y sus cachés (con autenticación y verificación de permisos)
app.delete("/image/:key", authenticateJWT(["delete"]), async (req, res) => {
  const { key } = req.params;

  try {
    // Eliminar la imagen de S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }),
    );

    // Eliminar todas las versiones cacheadas de la imagen en Redis
    const keys = await redisClient.keys(`${key}-*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.send(`Imagen ${key} y sus cachés han sido eliminados correctamente.`);
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    res.status(500).send("Error al eliminar la imagen y sus cachés");
  }
});

// Middleware de manejo de errores
app.use((err, req, res) => {
  console.error("Error capturado:", err);

  if (err instanceof multer.MulterError) {
    // Error específico de Multer
    return res.status(400).json({
      message: "Error al subir archivos",
      details: err.message,
    });
  }

  // Verifica si el error tiene un statusCode (se define con `err.statusCode`)
  const statusCode = err.statusCode || 500;
  const message =
    err.message ||
    "Ocurrió un error interno en el servidor. Inténtalo más tarde.";

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }), // Muestra el stack solo en desarrollo
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
