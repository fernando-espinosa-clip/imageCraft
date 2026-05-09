export const postgresQueries = {
  insertUser: `
    INSERT INTO users (first_name, last_name, email, apikey, username, password, file_permissions)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `,
  getUserByApiKey: "SELECT * FROM users WHERE apikey = $1",
  getUserById: "SELECT * FROM users WHERE id = $1",
  getUserByUsername: "SELECT * FROM users WHERE username = $1",
  insertImage: `
    INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `,
  deleteImage: "DELETE FROM images WHERE filename = $1 AND user_id = $2",
  listImages: `
    SELECT * FROM images
    WHERE user_id = $1
    ORDER BY id
    LIMIT $2 OFFSET $3
  `,
  countImages: "SELECT COUNT(*) as count FROM images WHERE user_id = $1",
  countUsers: "SELECT COUNT(*) as count FROM users",
  listImagesByUser: `
    SELECT * FROM images
    WHERE user_id = $1
    ORDER BY id
    LIMIT $2 OFFSET $3
  `,
  listAllImages: `
    SELECT * FROM images
    ORDER BY id
    LIMIT $1 OFFSET $2
  `,
  countImagesByUser: "SELECT COUNT(*) as count FROM images WHERE user_id = $1",
  countAllImages: "SELECT COUNT(*) as count FROM images",
  upsertImage: `
    INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (path) DO UPDATE SET
      file_type = EXCLUDED.file_type,
      size = EXCLUDED.size,
      original_filename = EXCLUDED.original_filename,
      original_file_type = EXCLUDED.original_file_type,
      original_size = EXCLUDED.original_size,
      upload_date = CURRENT_TIMESTAMP
    RETURNING *
  `,
  updateUserPassword: "UPDATE users SET password = $1 WHERE id = $2",
  updateUserApiKey: "UPDATE users SET apikey = $1 WHERE id = $2",
};
