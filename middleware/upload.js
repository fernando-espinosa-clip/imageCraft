import multer from "multer";

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG).",
      ),
      false,
    );
  }
};

/* export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar tamaño a 5MB
  },
}); */

// Configuración de Multer con validación de tipo de archivo
export const upload = multer({
  storage: multer.memoryStorage(),
  fileName: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar tamaño a 5MB
  },
});
