"use server";

import { insertConversationMessages } from "@/lib/db/messages";
import { getConversation } from "@/lib/db/conversations";
import { MessageData } from "@/lib/db/types";
import { randomUUID } from "crypto";
import { getLocalUserId } from "@/lib/local-user";

export async function saveConversationMessages(
  userMessageContent: string,
  assistantMessageContent: string,
  conversationId: string
) {
  const userId = await getLocalUserId();

  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages: MessageData[] = [
    {
      content: userMessageContent,
      role: "user",
      conversationId,
      userId,
      id: randomUUID(),
    },
    {
      content: assistantMessageContent,
      conversationId,
      userId,
      id: randomUUID(),
      role: "assistant",
    },
  ];

  await insertConversationMessages(messages);
}
