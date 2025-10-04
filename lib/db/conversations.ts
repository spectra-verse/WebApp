import { db } from "./init";
import { Conversation, InsertConversationData, Message } from "./types";

export function insertConversation(conversationData: InsertConversationData) {
  const stmt = db.prepare(
    "INSERT INTO conversations (id, userId, name, model) VALUES (?, ?, ?, ?)"
  );
  return stmt.run(
    conversationData.id,
    conversationData.userId,
    conversationData.name ?? "",
    conversationData.model ?? null
  );
}

export function updateConversationModel(conversationId: string, userId: string, model: string) {
  const stmt = db.prepare("UPDATE conversations SET model = ? WHERE id = ? AND userId = ?");
  return stmt.run(model, conversationId, userId);
}

export function deleteConversation(conversationId: string, userId: string) {
  const stmt = db.prepare("DELETE FROM conversations WHERE id = ? AND userId = ?");
  return stmt.run(conversationId, userId);
}

export function getConversation(conversationId: string, userId: string) {
  const stmt = db.prepare("SELECT * FROM conversations WHERE id = ? AND userId = ?");
  return stmt.get(conversationId, userId) as Conversation | undefined;
}

export function getConversationMessages(conversationId: string, userId: string) {
  const stmt = db.prepare(
    `SELECT
      m.*
    FROM conversations as c
    JOIN messages as m on m.conversationId = c.id
    WHERE c.id = ? AND c.userId = ?
    ORDER BY m.createdAt ASC`
  );
  return stmt.all(conversationId, userId) as Message[];
}

export function updateConversationName(conversationId: string, userId: string, name: string) {
  const stmt = db.prepare("UPDATE conversations SET name = ? WHERE id = ? AND userId = ?");
  return stmt.run(name, conversationId, userId);
}

export function getAllConversations(userId: string) {
  const stmt = db.prepare(
    "SELECT * FROM conversations WHERE userId = ? ORDER BY createdAt DESC"
  );
  return stmt.all(userId) as Conversation[];
}
