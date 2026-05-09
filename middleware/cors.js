import cors from "cors";

const whitelist = (process.env.CORS_WHITELIST || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, false);
    }
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("No autorizado por política de CORS"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-New-Token"],
  credentials: true,
  maxAge: 600,
};

export default cors(corsOptions);
