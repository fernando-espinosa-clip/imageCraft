export const sqliteQueries = {
  insertUser: `
    INSERT INTO users (first_name, last_name, email, apikey, username, password, file_permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  getUserByApiKey: "SELECT * FROM users WHERE apikey = ?",
  getUserById: "SELECT * FROM users WHERE id = ?",
  getUserByUsername: "SELECT * FROM users WHERE username = ?",
  insertImage: `
    INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  deleteImage: "DELETE FROM images WHERE filename = ? AND user_id = ?",
  listImages: `
    SELECT * FROM images
    WHERE user_id = ?
    ORDER BY id
    LIMIT ? OFFSET ?
  `,
  countImages: "SELECT COUNT(*) as count FROM images WHERE user_id = ?",
  countUsers: "SELECT COUNT(*) as count FROM users",
  listImagesByUser: `
    SELECT * FROM images
    WHERE user_id = ?
    ORDER BY id
    LIMIT ? OFFSET ?
  `,
  listAllImages: `
    SELECT * FROM images
    ORDER BY id
    LIMIT ? OFFSET ?
  `,
  countImagesByUser: "SELECT COUNT(*) as count FROM images WHERE user_id = ?",
  countAllImages: "SELECT COUNT(*) as count FROM images",
  upsertImage: `
    INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      file_type = excluded.file_type,
      size = excluded.size,
      original_filename = excluded.original_filename,
      original_file_type = excluded.original_file_type,
      original_size = excluded.original_size,
      upload_date = CURRENT_TIMESTAMP
  `,
  updateUserPassword: "UPDATE users SET password = ? WHERE id = ?",
  updateUserApiKey: "UPDATE users SET apikey = ? WHERE id = ?",
};
