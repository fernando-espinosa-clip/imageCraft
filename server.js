import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

const app = express();
const port = process.env.PORT || 3000;

// Servir contenido estático desde la carpeta "public"
app.use(express.static("public"));

// También servir archivos desde la carpeta "uploads" (opcional)
app.use("/uploads", express.static("uploads"));

// Configuración de Multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Ruta para subir y optimizar imágenes
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se ha subido ninguna imagen.");
  }

  const { filename, path: imagePath } = req.file;
  const outputFilename = `optimized-${filename}`;
  const outputPath = `uploads/${outputFilename}`;

  try {
    // Optimizar la imagen
    await sharp(imagePath)
      .resize(800) // Redimensionar a un ancho máximo de 800px
      .webp({ quality: 80 }) // Convertir a WebP con 80% de calidad
      .toFile(outputPath);

    // Eliminar el archivo original
    await fs.unlink(imagePath);

    res.send(`Imagen optimizada y guardada como: ${outputFilename}`);
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    res.status(500).send("Error al procesar la imagen");
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
