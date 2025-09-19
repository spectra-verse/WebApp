import { db } from "./init";
import { Conversation, InsertConversationData, Message } from "./types";

export function insertConversation(conversationData: InsertConversationData) {
  const stmt = db.prepare(
    "INSERT INTO conversations (id, name, model) VALUES (?, ?, ?)"
  );
  return stmt.run(
    conversationData.id,
    conversationData.name ?? "",
    conversationData.model ?? null
  );
}

export function updateConversationModel(conversationId: string, model: string) {
  const stmt = db.prepare("UPDATE conversations SET model = ? WHERE id = ?");
  return stmt.run(model, conversationId);
}

export function deleteConversation(conversationId: string) {
  const stmt = db.prepare("DELETE FROM conversations WHERE id = ?");
  return stmt.run(conversationId);
}

export function getConversation(conversationId: string) {
  const stmt = db.prepare("SELECT * FROM conversations WHERE id = ?");
  return stmt.get(conversationId) as Conversation | undefined;
}

export function getConversationMessages(conversationId: string) {
  const stmt = db.prepare(
    `SELECT 
      m.*
    FROM conversations as c
    JOIN messages as m on m.conversationId = c.id
    WHERE c.id = ? 
    ORDER BY m.createdAt ASC`
  );
  return stmt.all(conversationId) as Message[];
}

export function updateConversationName(conversationId: string, name: string) {
  const stmt = db.prepare("UPDATE conversations SET name = ? WHERE id = ?");
  return stmt.run(name, conversationId);
}

export function getAllConversations() {
  const stmt = db.prepare(
    "SELECT * FROM conversations ORDER BY createdAt DESC"
  );
  return stmt.all() as Conversation[];
}
