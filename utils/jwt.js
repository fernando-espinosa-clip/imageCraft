import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { decrypt } from "./encrypt.js";

// Función para generar token JWT
export function generateToken(user, loginMode) {
  return jwt.sign(
    {
      userId: user.id,
      permissions: user.permissions,
      loginMode: loginMode, // 'credentials' o 'apikey'
    },
    process.env.JWT_SECRET + user.apiKey,
    { expiresIn: "1h" },
  );
}

export function verifyToken(token) {
  const parts = token.split(".");
  const JWT = parts.filter((part, index) => index < 3).join(".");
  const api = parts[parts.length - 1];
  return jwt.verify(JWT, config.jwtSecret + decrypt(api));
}
