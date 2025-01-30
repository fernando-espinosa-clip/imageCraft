export function toUrlFriendly(text) {
  return text
    .toLowerCase() // Convertir a minúsculas
    .trim() // Eliminar espacios al inicio y al final
    .normalize("NFD") // Normalizar las letras con acentos (á => a, ñ => n, etc.)
    .replace(/[\u0300-\u036f]/g, "") // Eliminar restos de acentuación
    .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales, excepto espacios y guiones
    .replace(/\s+/g, "-") // Reemplazar espacios por guiones
    .replace(/-+/g, "-"); // Eliminar guiones duplicados
}
export default toUrlFriendly;
