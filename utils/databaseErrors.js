export class UniqueConstraintError extends Error {
  constructor(field) {
    super(`El ${field} ya está en uso.`);
    this.name = "UniqueConstraintError";
    this.field = field;
  }
}

export function handleDatabaseError(error) {
  // SQLite
  if (error.code === "SQLITE_CONSTRAINT") {
    if (error.message.includes("users.email")) {
      throw new UniqueConstraintError("email");
    }
    if (error.message.includes("users.username")) {
      throw new UniqueConstraintError("nombre de usuario");
    }
  }

  // PostgreSQL
  if (error.code === "23505") {
    // Unique violation in PostgreSQL
    if (error.constraint === "users_email_key") {
      throw new UniqueConstraintError("email");
    }
    if (error.constraint === "users_username_key") {
      throw new UniqueConstraintError("nombre de usuario");
    }
  }

  // Si no es un error de unicidad conocido, lanzamos el error original
  throw error;
}
