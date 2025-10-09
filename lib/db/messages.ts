import { db } from "@/db";
import { messages } from "@/db/schema";
import { MessageData } from "./types";

export async function insertConversationMessages(messageData: MessageData[]) {
  return await db.insert(messages).values(
    messageData.map((msg) => ({
      id: msg.id,
      content: msg.content,
      conversationId: msg.conversationId,
      userId: msg.userId,
      role: msg.role,
    }))
  );
}
