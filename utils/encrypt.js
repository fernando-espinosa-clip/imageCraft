import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Configuración de encriptación
const algorithm = "aes-256-ctr"; // Algoritmo de encriptación
const JWTS = process.env.JWT_SECRET;
const secret = JWTS.substring(0, 32); // Clave secreta (32 caracteres para AES-256)
const ivLength = 16; // Longitud del vector de inicialización (IV)

// Función para encriptar texto
export function encrypt(text) {
  const iv = crypto.randomBytes(ivLength); // Genera un IV aleatorio
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv); // Crea el cifrador

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  // Devuelve el texto encriptado junto con el IV en un formato base64
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// Función para desencriptar texto
export function decrypt(encryptedText) {
  const [iv, encryptedData] = encryptedText
    .split(":")
    .map((part) => Buffer.from(part, "hex")); // Extrae IV y datos

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv); // Crea el descifrador

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);
  return decrypted.toString("utf8"); // Retorna el texto original como UTF-8
}
