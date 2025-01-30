import multer from "multer"; // Import multer

// Manejador de errores global
// eslint-disable-next-line no-unused-vars
export const globalErrorHandling = (error, req, res, next) => {
  console.error(error);
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .send("El archivo es demasiado grande. El tamaño máximo es de 5MB.");
    }
  }

  res.status(500).send(error.message || "Error interno del servidor");
};

export default globalErrorHandling;
