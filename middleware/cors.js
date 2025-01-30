import config from "../config/index.js";
import cors from "cors";

const whitelist = process.env.CORS_WHITELIST
  ? config.corsWhitelist.split(",")
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

export default cors(corsOptions);
