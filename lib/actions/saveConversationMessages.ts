"use server";

import { insertConversationMessages } from "@/lib/db/messages";
import { MessageData } from "@/lib/db/types";
import { randomUUID } from "crypto";

/**
 * Server action to save user and assistant messages to the database
 * Called from client-side after chat completion
 */
export async function saveConversationMessages(
  userMessageContent: string,
  assistantMessageContent: string,
  conversationId: string
) {
  const messages: MessageData[] = [
    {
      content: userMessageContent,
      role: "user",
      conversationId,
      id: randomUUID(),
    },
    {
      content: assistantMessageContent,
      conversationId: conversationId,
      id: randomUUID(),
      role: "assistant",
    },
  ];

  await insertConversationMessages(messages);
}
