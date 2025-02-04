import config from "../config/index.js";

const mockUsers = [
  {
    id: 1,
    first_name: "Geoffrey",
    last_name: "Cessford",
    email: "gcessford0@wikia.com",
    apikey: "facfb4e5-8f4c-ba9a-4e7d-e04ef0b084da",
    username: "gcessford0",
    permissions: ["delete"],
  },
  {
    id: 2,
    first_name: "Tiffanie",
    last_name: "Eakley",
    email: "teakley1@psu.edu",
    apikey: "0c8919fa-85fa-61b0-1cf8-8e1a70e0c6a3",
    username: "teakley1",
    permissions: ["upload"],
  },
  {
    id: 3,
    first_name: "Sherlock",
    last_name: "Ashelford",
    email: "sashelford2@google.com.au",
    apikey: "501fbc1b-db1b-e938-b80f-3775873ae9fc",
    username: "sashelford2",
    permissions: ["list"],
  },
  {
    id: 4,
    first_name: "Jesse",
    last_name: "Pointer",
    email: "jpointer3@nba.com",
    apikey: "a24dd9de-17e1-a7ae-fb74-c5ce3c48c0cb",
    username: "jpointer3",
    permissions: ["delete"],
  },
  {
    id: 5,
    first_name: "Brett",
    last_name: "Gilbertson",
    email: "bgilbertson4@parallels.com",
    apikey: "cf5a3449-750b-dc38-0dd9-6de77c19cb80",
    username: "bgilbertson4",
    permissions: ["delete", "upload"],
  },
  {
    id: 6,
    first_name: "Tobie",
    last_name: "Birney",
    email: "tbirney5@istockphoto.com",
    apikey: "ddcf460b-ff48-f9d9-740f-34ed8c38f6c4",
    username: "tbirney5",
    permissions: ["list", "upload", "delete"],
  },
  {
    id: 7,
    first_name: "Ruthy",
    last_name: "Genever",
    email: "rgenever6@netlog.com",
    apikey: "e06bdfd7-ef26-bf8a-4b8f-3c48b1e13f97",
    username: "rgenever6",
    permissions: ["list", "delete", "upload"],
  },
  {
    id: 8,
    first_name: "Erena",
    last_name: "Boatwright",
    email: "eboatwright7@cpanel.net",
    apikey: "6ed032b8-38db-be9a-cdcd-5cc8a048f885",
    username: "eboatwright7",
    permissions: ["list", "upload"],
  },
  {
    id: 9,
    first_name: "Dallis",
    last_name: "Catlow",
    email: "dcatlow8@issuu.com",
    apikey: "c31de8ab-fba0-5f76-63b1-ced3b1c9b0d7",
    username: "dcatlow8",
    permissions: ["list", "delete"],
  },
  {
    id: 10,
    first_name: "Lenore",
    last_name: "Samwell",
    email: "lsamwell9@youtu.be",
    apikey: "5f6caf43-28e4-ede1-6dbb-3da0330cb83c",
    username: "lsamwell9",
    permissions: ["list", "delete", "upload"],
  },
  {
    id: 11,
    first_name: "Kaycee",
    last_name: "Ketchen",
    email: "kketchena@shareasale.com",
    apikey: "a3ab71c1-de60-c5a5-53d0-42ea44bdf8c6",
    username: "kketchena",
    permissions: ["list", "delete", "upload"],
  },
  {
    id: 12,
    first_name: "Stormy",
    last_name: "Crank",
    email: "scrankb@skyrock.com",
    apikey: "aefddad9-afec-ccbe-59ed-7cc05e2e077e",
    username: "scrankb",
    permissions: ["delete", "list", "upload"],
  },
  {
    id: 13,
    first_name: "Eustace",
    last_name: "Soreau",
    email: "esoreauc@examiner.com",
    apikey: "81728b0d-7dff-6ff0-fd7b-1ce1cf62f89b",
    username: "esoreauc",
    permissions: ["upload", "list", "delete"],
  },
  {
    id: 14,
    first_name: "Dominick",
    last_name: "Katzmann",
    email: "dkatzmannd@baidu.com",
    apikey: "8bd7e927-5d2c-18fa-df52-77af8d6dfcda",
    username: "dkatzmannd",
    permissions: ["upload", "delete", "list"],
  },
  {
    id: 15,
    first_name: "Adela",
    last_name: "Wevell",
    email: "awevelle@go.com",
    apikey: "be20ea5b-a169-cf33-de2b-46bc3eaa689a",
    username: "awevelle",
    permissions: ["delete"],
  },
  {
    id: 16,
    first_name: "Tymon",
    last_name: "Milan",
    email: "tmilanf@nymag.com",
    apikey: "d3aa3b3f-bbff-0ecb-6270-43edda2082c2",
    username: "tmilanf",
    permissions: ["delete", "upload"],
  },
  {
    id: 17,
    first_name: "Corey",
    last_name: "Aspital",
    email: "caspitalg@fema.gov",
    apikey: "9f8dcdfd-9c4d-f4a5-9e30-e8a7e501f4a0",
    username: "caspitalg",
    permissions: ["list", "upload"],
  },
  {
    id: 18,
    first_name: "Darci",
    last_name: "Elacoate",
    email: "delacoateh@fema.gov",
    apikey: "d94baa2d-24e4-fab6-adda-b68b2e624c70",
    username: "delacoateh",
    permissions: ["list", "upload"],
  },
  {
    id: 19,
    first_name: "Josie",
    last_name: "Bertelet",
    email: "jberteleti@last.fm",
    apikey: "ef0a1e39-d2b2-9de9-adff-ba6fd3adea00",
    username: "jberteleti",
    permissions: ["delete", "upload"],
  },
  {
    id: 20,
    first_name: "Ferrell",
    last_name: "Insall",
    email: "finsallj@google.it",
    apikey: "17be84e4-0103-b3c2-8c8c-c5b7d9f154c9",
    username: "finsallj",
    permissions: ["upload", "delete", "list"],
  },
];

export async function seedUsers(db) {
  const dbType = config.database.type;

  for (const user of mockUsers) {
    try {
      let query;
      let params;

      if (dbType === "sqlite") {
        query = `
          INSERT OR IGNORE INTO users (first_name, last_name, email, apikey, username, file_permissions)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        params = [
          user.first_name,
          user.last_name,
          user.email,
          user.apikey,
          user.username,
          JSON.stringify(user.permissions),
        ];
      } else if (dbType === "postgresql") {
        query = `
          INSERT INTO users (first_name, last_name, email, apikey, username, file_permissions)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO NOTHING
        `;
        params = [
          user.first_name,
          user.last_name,
          user.email,
          user.apikey,
          user.username,
          user.permissions,
        ];
      } else {
        throw new Error(`Unsupported database type: ${dbType}`);
      }

      await db.query(query, params);
    } catch (error) {
      console.error(`Error seeding user ${user.email}:`, error);
    }
  }

  console.log("User seeding completed");
}
