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
    if (error.message.includes("users.apikey")) {
      throw new UniqueConstraintError("API key");
    }
  }

  // PostgreSQL
  if (error.code === "23505") {
    if (error.constraint === "users_email_key") {
      throw new UniqueConstraintError("email");
    }
    if (error.constraint === "users_username_key") {
      throw new UniqueConstraintError("nombre de usuario");
    }
    if (error.constraint === "users_apikey_key") {
      throw new UniqueConstraintError("API key");
    }
  }

  throw error;
}
