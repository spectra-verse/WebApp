import { db } from "./init";

const createTables = `
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT NOT NULL PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT,
        model TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT NOT NULL PRIMARY KEY,
        conversationId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        role TEXT DEFAULT 'assistant',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );
    `;

async function up() {
  try {
    // Check if tables exist
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('conversations', 'messages')"
    ).all() as Array<{ name: string }>;

    if (tables.length > 0) {
      console.log("Cleaning up existing data...");
      // Delete all existing data
      db.exec("DELETE FROM messages;");
      db.exec("DELETE FROM conversations;");
      console.log("Existing data deleted");

      // Check for userId column in conversations
      const conversationsInfo = db
        .prepare("PRAGMA table_info(conversations)")
        .all() as Array<{
        name: string;
        type: string;
        notnull: number;
        dflt_value: string | null;
        pk: number;
      }>;

      const userIdExistsInConversations = conversationsInfo.some(
        (column) => column.name === "userId"
      );

      if (!userIdExistsInConversations) {
        console.log("Adding userId column to conversations table");
        db.exec("ALTER TABLE conversations ADD COLUMN userId TEXT NOT NULL DEFAULT '';");
      }

      // Check for userId column in messages
      const messagesInfo = db
        .prepare("PRAGMA table_info(messages)")
        .all() as Array<{
        name: string;
        type: string;
        notnull: number;
        dflt_value: string | null;
        pk: number;
      }>;

      const userIdExistsInMessages = messagesInfo.some(
        (column) => column.name === "userId"
      );

      if (!userIdExistsInMessages) {
        console.log("Adding userId column to messages table");
        db.exec("ALTER TABLE messages ADD COLUMN userId TEXT NOT NULL DEFAULT '';");
      }

      // Check for model column
      const modelColumnExists = conversationsInfo.some(
        (column) => column.name === "model"
      );

      if (!modelColumnExists) {
        console.log("Adding model column to conversations table");
        db.exec("ALTER TABLE conversations ADD COLUMN model TEXT;");
      }
    } else {
      // Tables don't exist, create them
      console.log("Creating tables...");
      db.exec(createTables);
      console.log("Tables created successfully");
    }
  } catch (error) {
    console.error("Error creating/updating tables:", error);
  }
}

up();
