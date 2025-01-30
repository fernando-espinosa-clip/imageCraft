import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { decrypt, encrypt } from "./encrypt.js";

// Función para generar token JWT
export function generateToken(user) {
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

export function verifyToken(token) {
  const parts = token.split(".");
  const JWT = parts.filter((part, index) => index < 3).join(".");
  const api = parts[parts.length - 1];
  return jwt.verify(JWT, config.jwtSecret + decrypt(api));
}
