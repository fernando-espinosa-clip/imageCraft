export const sqliteQueries = {
  insertUser: `
    INSERT OR IGNORE INTO users (first_name, last_name, email, apikey, username, file_permissions)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  getUserByApiKey: "SELECT * FROM users WHERE apikey = ?",
  getUserById: "SELECT * FROM users WHERE id = ?",
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
};
