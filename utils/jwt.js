import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { decrypt, encrypt } from "./encrypt.js";

export function generateToken(user, loginMode) {
  const api = encrypt(user.apiKey);
  return (
    jwt.sign(
      {
        userId: user.id,
        permissions: user.permissions,
        loginMode: loginMode,
      },
      config.jwtSecret + user.apiKey,
      { expiresIn: config.jwtExpirationTime },
    ) +
    "." +
    api
  );
}

export function verifyToken(token) {
  const parts = token.split(".");
  const JWT = parts.filter((part, index) => index < 3).join(".");
  const api = parts[parts.length - 1];
  const apiKey = decrypt(api);
  const payload = jwt.verify(JWT, config.jwtSecret + apiKey);
  return { ...payload, apiKey };
}
