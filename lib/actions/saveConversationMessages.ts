"use server";

import { insertConversationMessages } from "@/lib/db/messages";
import { getConversation } from "@/lib/db/conversations";
import { MessageData } from "@/lib/db/types";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server action to save user and assistant messages to the database
 * Called from client-side after chat completion
 */
export async function saveConversationMessages(
  userMessageContent: string,
  assistantMessageContent: string,
  conversationId: string
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  const userId = session.user.id;

  // Verify user owns this conversation
  const conversation = getConversation(conversationId, userId);
  if (!conversation) {
    throw new Error("Conversation not found or unauthorized");
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
      conversationId: conversationId,
      userId,
      id: randomUUID(),
      role: "assistant",
    },
  ];

  await insertConversationMessages(messages);
}
