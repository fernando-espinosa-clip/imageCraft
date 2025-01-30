import fs from "fs";
import fsp from "fs/promises";

import path from "path";

/**
 * Función para enlistar los contenidos de un directorio
 * @param {string} dirPath - Ruta del directorio a listar
 * @returns {Promise<string[]>} - Promesa con un arreglo de nombres de archivos y carpetas
 */
export const directoryContent = async (dirPath) => {
  try {
    const archivos = await fs.promises.readdir(dirPath); // Lee los contenidos del directorio
    const contenidos = archivos.map((archivo) => {
      const rutaCompleta = path.join(dirPath, archivo); // Genera la ruta completa
      const stats = fs.statSync(rutaCompleta); // Obtiene información sobre el archivo o directorio

      return stats.isDirectory()
        ? `${archivo}/` // Agrega un "/" si es un directorio
        : archivo; // Si no es un directorio, devuelve solo el nombre
    });

    return contenidos;
  } catch (error) {
    console.error("Error al leer el directorio:", error.message);
    throw new Error(`No se pudo leer el directorio: ${dirPath}`);
  }
};

/**
 * Función para obtener los permisos de un directorio o archivo
 * @param {string} dirPath - Ruta del archivo o directorio
 * @returns {Promise<string>} - Permisos en formato similar a "rwxrwxr-x"
 */
export const enlistPermissions = async (dirPath) => {
  try {
    // Obtiene estadísticas del archivo/directorio
    const stats = await fsp.stat(dirPath);

    // Extrae los permisos en formato octal (ej. 0o755)
    const permisosOctales = (stats.mode & 0o777).toString(8);

    // Convierte los permisos octales a formato legible (rwx)
    const permisosLegibles = permisosOctales
      .split("")
      .map((octal) => convertOctalToRwx(parseInt(octal, 10)))
      .join("");

    return `${permisosLegibles} (${permisosOctales})`;
  } catch (error) {
    console.error(`Error al obtener permisos de ${dirPath}:`, error.message);
    throw error;
  }
};

/**
 * Función para convertir un valor de permisos octales (0-7) al formato "rwx"
 * @param {number} valorOctal - Valor de permisos en formato octal (0-7)
 * @returns {string} - Permisos en formato "rwx"
 */
export const convertOctalToRwx = (valorOctal) => {
  return [
    valorOctal & 4 ? "r" : "-", // Lectura
    valorOctal & 2 ? "w" : "-", // Escritura
    valorOctal & 1 ? "x" : "-", // Ejecución
  ].join(""); // Une los permisos en formato rwx
};

/**
 * Función para crear un directorio con permisos específicos
 * @param {string} path - Ruta del directorio a crear
 * @param {string} permissions - Permisos en formato octal (ej. "0755", "0777")
 */
export const createDir = (path, permissions = "0777") => {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { mode: parseInt(permissions, 8) }); // Crea el directorio con los permisos
      console.log(`Directorio creado en: ${path} con permisos ${permissions}`);
    } else {
      console.log(`El directorio ya existe: ${path}`);
    }
  } catch (error) {
    console.error(`Error al crear el directorio: ${error.message}`);
  }
};

export default directoryContent;
