import crypto from "crypto";
import fs from "fs";
import path from "path";

// Ruta del archivo .env
const envFilePath = path.resolve(process.cwd(), ".env");

// Función para generar un secreto JWT seguro
function generateJWTSecret() {
  // Generar un secreto seguro con 64 bytes de entropía
  return crypto.randomBytes(64).toString("hex");
}

// Guardar el secreto en .env
function saveSecretToEnv(secret) {
  const envVar = `JWT_SECRET=${secret}`;

  // Verificar si ya existe un archivo .env
  if (fs.existsSync(envFilePath)) {
    // Verificar si ya hay una clave JWT_SECRET en el archivo
    const envContent = fs.readFileSync(envFilePath, "utf-8");
    if (envContent.includes("JWT_SECRET")) {
      console.error(
        "Error: Ya existe un JWT_SECRET configurado en tu archivo .env. No se sobrescribió el secreto.",
      );
      return;
    }
    // Agregar el secreto al archivo existente
    fs.appendFileSync(envFilePath, `\n${envVar}\n`);
  } else {
    // Crear un archivo .env y escribir el secreto
    fs.writeFileSync(envFilePath, `${envVar}\n`);
  }

  console.log(`El JWT_SECRET se ha guardado en el archivo .env`);
}

// Generar el secreto
try {
  const jwtSecret = generateJWTSecret();
  console.log("JWT_SECRET generado:", jwtSecret);

  // Guardar el secreto en el archivo .env
  saveSecretToEnv(jwtSecret);
} catch (err) {
  console.error("Error al generar el JWT_SECRET:", err.message);
}
