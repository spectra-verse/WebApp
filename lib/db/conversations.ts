import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { Conversation, InsertConversationData, Message } from "./types";
import { eq, and, desc } from "drizzle-orm";

export async function insertConversation(conversationData: InsertConversationData) {
  const now = new Date();
  return await db.insert(conversations).values({
    id: conversationData.id,
    userId: conversationData.userId,
    name: conversationData.name ?? "",
    model: conversationData.model ?? null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateConversationModel(conversationId: string, userId: string, model: string) {
  return await db
    .update(conversations)
    .set({ model })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
}

export async function deleteConversation(conversationId: string, userId: string) {
  return await db
    .delete(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
}

export async function getConversation(conversationId: string, userId: string) {
  const result = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .limit(1);

  if (!result[0]) return undefined;

  return {
    ...result[0],
    createdAt: result[0].createdAt.toISOString(),
  } as Conversation;
}

export async function getConversationMessages(conversationId: string, userId: string) {
  const result = await db
    .select({
      id: messages.id,
      content: messages.content,
      role: messages.role,
      conversationId: messages.conversationId,
      userId: messages.userId,
      createdAt: messages.createdAt,
    })
    .from(conversations)
    .innerJoin(messages, eq(messages.conversationId, conversations.id))
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .orderBy(messages.createdAt);

  return result.map(msg => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  })) as Message[];
}

export async function updateConversationName(conversationId: string, userId: string, name: string) {
  return await db
    .update(conversations)
    .set({ name })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
}

export async function getAllConversations(userId: string) {
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt));

  return result.map(conv => ({
    ...conv,
    createdAt: conv.createdAt.toISOString(),
  })) as Conversation[];
}

export async function deleteAllUserConversations(userId: string) {
  // Drizzle will handle cascade deletes based on schema
  // First delete all messages (explicit)
  await db.delete(messages).where(eq(messages.userId, userId));

  // Then delete all conversations
  return await db.delete(conversations).where(eq(conversations.userId, userId));
}
