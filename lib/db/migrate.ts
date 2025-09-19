import { db } from "./init";

const createTables = `
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT,
        model TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT NOT NULL PRIMARY KEY,
        conversationId TEXT NOT NULL,
        content TEXT NOT NULL,
        role TEXT DEFAULT 'assistant',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );
    `;

async function up() {
  try {
    db.exec(createTables);

    // Add model column to existing conversations table if it doesn't exist
    const tableInfo = db
      .prepare("PRAGMA table_info(conversations)")
      .all() as Array<{
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>;
    const modelColumnExists = tableInfo.some(
      (column) => column.name === "model"
    );

    if (!modelColumnExists) {
      console.log("Adding model column to conversations table");
      db.exec("ALTER TABLE conversations ADD COLUMN model TEXT;");
    }
  } catch (error) {
    console.error("Error creating/updating tables:", error);
  }
}

up();
