import sqlite3 from "sqlite3";
import { open } from "sqlite"; // Este es necesario para usar Promesas correctamente
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Define __dirname para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export async function initializeDatabase() {
  console.log("Initializing database...");

  const dbFilePath = path.join(__dirname, "..", "database-imagecraft.sqlite");

  // Verificar si la base de datos existe
  const dbExists = fs.existsSync(dbFilePath);

  try {
    console.log("Opening database...");
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.error("Error initializing database:", error);
  }

  if (!dbExists) {
    console.log(
      "The database does not exist; it will be created, and user data will be seeded.",
    );
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        apikey TEXT UNIQUE,
        username TEXT UNIQUE,
        file_permissions TEXT, -- Stored as JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        path TEXT NOT NULL,
        filename TEXT NOT NULL,
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
    `);

    // Llamada a la función que inserta los datos dummy
    console.log("Seeding initial data...");
    await dataSeed();
  }

  return db;
}

export async function getDatabase() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}

// Función para sembrar datos dummy en la tabla 'users'
export async function dataSeed() {
  const database = await getDatabase();

  // Datos dummy a insertar
  const users = [
    [
      "John",
      "Doe",
      "john.doe1@example.com",
      "1f3c2ab4-ea57-4a9b-b385-a1b2c3d4e5f6",
      "johndoe1",
      "upload,delete",
    ],
    [
      "Jane",
      "Smith",
      "jane.smith1@example.com",
      "5b4d3f67-7348-45bc-890d-abcd12345678",
      "janesmith1",
      "list",
    ],
    [
      "Alice",
      "Brown",
      "alice.brown1@example.com",
      "123e4567-e89b-12d3-a456-426614174000",
      "alicebr1",
      "upload,list",
    ],
    [
      "Bob",
      "Johnson",
      "bob.johnson1@example.com",
      "9f8b7654-321c-43cd-a789-fedcba987654",
      "bobjohnson1",
      "upload,delete,list",
    ],
    [
      "Emily",
      "White",
      "emily.white1@example.com",
      "3478da19-d4e6-47cc-922c-dc2fbcdb6b3a",
      "emwhite1",
      "delete",
    ],
    [
      "Michael",
      "Green",
      "michael.green1@example.com",
      "456f7d88-1210-4dee-a567-c788b123a456",
      "mikegreen1",
      "list,upload",
    ],
    [
      "Laura",
      "Scott",
      "laura.scott1@example.com",
      "683a5d7a-b045-4abc-ba12-98765432abcd",
      "laurascott1",
      "delete,upload",
    ],
    [
      "David",
      "Miller",
      "david.miller1@example.com",
      "89f7a8e5-5334-4875-bc90-fedc87654321",
      "davidm1",
      "upload",
    ],
    [
      "Sophia",
      "Taylor",
      "sophia.taylor1@example.com",
      "9a1b2c3d-4e5f-678a-9b0c-1d2e3f4a5b6c",
      "sophiat1",
      "list,delete",
    ],
    [
      "Ethan",
      "Anderson",
      "ethan.anderson1@example.com",
      "7894123c-dd56-4b6a-890a-abcdef123456",
      "ethana1",
      "upload,list,delete",
    ],
    [
      "Sarah",
      "Harris",
      "sarah.harris1@example.com",
      "3478db19-c2a6-47cc-912c-cd2cbdab7b3c",
      "sarahharris1",
      "delete",
    ],
    [
      "Matthew",
      "Clark",
      "matthew.clark1@example.com",
      "567ef2d4-11c3-61cd-ab56-fedc10203040",
      "mclark1",
      "list",
    ],
    [
      "Olivia",
      "Adams",
      "olivia.adams1@example.com",
      "132fa8e5-1332-1609-0f90-facdedbe1234",
      "oliviaa1",
      "upload,delete",
    ],
    [
      "Joshua",
      "James",
      "joshua.james1@example.com",
      "7a9d1234-0c5f-12de-99dd-fedcface1234",
      "jamesjos1",
      "delete,list",
    ],
    [
      "Hannah",
      "Walker",
      "hannah.walker1@example.com",
      "987ab45d-5c14-4aed-802c-f56bfdcd1234",
      "hwalker1",
      "list",
    ],
    [
      "Daniel",
      "Roberts",
      "daniel.roberts1@example.com",
      "a12b3d4e-5f6a-197b-92cd-98abcdefab12",
      "danroberts1",
      "upload",
    ],
    [
      "Chloe",
      "Lewis",
      "chloe.lewis1@example.com",
      "678e4567-432f-11df-921d-fedcbade4589",
      "chloelewis1",
      "upload,delete",
    ],
    [
      "Alexander",
      "Young",
      "alex.young1@example.com",
      "3478ad12-43e6-4acd-801c-55abcd231234",
      "alexy1",
      "delete,upload",
    ],
    [
      "Victoria",
      "King",
      "victoria.king1@example.com",
      "435abc12-cd09-4fed-936c-fedcacbd1234",
      "vking1",
      "list,upload",
    ],
    [
      "Benjamin",
      "Wright",
      "ben.wright1@example.com",
      "567d9a32-f321-1bde-8f90-fedc9786cd12",
      "benwright1",
      "upload,delete,list",
    ],
  ];

  // Inserción de datos
  for (const user of users) {
    await database.run(
      `
                INSERT INTO users (first_name, last_name, email, apikey, username, file_permissions)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
      user,
    );
  }

  console.log("Datos insertados exitosamente en la tabla 'users'.");
}
