export const postgresQueries = {
  insertUser: `
    INSERT INTO users (first_name, last_name, email, apikey, username, file_permissions)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `,
  getUserByApiKey: "SELECT * FROM users WHERE apikey = $1",
  getUserById: "SELECT * FROM users WHERE id = $1",
  insertImage: `
    INSERT INTO images (user_id, filename, path, file_type, size, original_filename, original_file_type, original_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
  deleteImage: "DELETE FROM images WHERE filename = $1 AND user_id = $2",
  listImages: `
    SELECT * FROM images
    WHERE user_id = $1
    ORDER BY id
    LIMIT $2 OFFSET $3
  `,
  countImages: "SELECT COUNT(*) as count FROM images WHERE user_id = $1",
};
