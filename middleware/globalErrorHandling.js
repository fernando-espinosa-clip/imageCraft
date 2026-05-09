import multer from "multer";

// eslint-disable-next-line no-unused-vars
export const globalErrorHandling = (error, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  if (error.message === "No autorizado por política de CORS") {
    return res.status(403).json({ error: "Not allowed by CORS policy" });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ error: "File upload error." });
  }

  if (error.message?.startsWith("Tipo de archivo no válido")) {
    return res.status(400).json({ error: error.message });
  }

  const statusCode = error.statusCode || error.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message || "Internal server error";

  res.status(statusCode).json({ error: message });
};

export default globalErrorHandling;
