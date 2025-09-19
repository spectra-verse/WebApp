import Database from "better-sqlite3";

const DB_NAME = "ollama-next.db";
export const db = new Database(DB_NAME);
