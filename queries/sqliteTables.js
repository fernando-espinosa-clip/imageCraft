export const createSQLiteTables = `
    CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     first_name TEXT,
     last_name TEXT,
     email TEXT UNIQUE,
     apikey TEXT UNIQUE,
     username TEXT UNIQUE,
     file_permissions TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      file_type TEXT,
      size INTEGER,
      original_filename TEXT,
      original_file_type TEXT,
      original_size INTEGER,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      tags TEXT,
      metadata TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TRIGGER IF NOT EXISTS update_users_updated_at
        AFTER UPDATE ON users
        FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
`;
