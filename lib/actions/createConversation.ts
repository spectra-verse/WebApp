"use server";

import { insertConversation } from "@/lib/db/conversations";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { getLocalUserId } from "@/lib/local-user";

async function generateConversationName(userMessage: string) {
  return `${userMessage.substring(0, 15)}...`;
}

export async function createConversation(message: string, model: string) {
  const userId = await getLocalUserId();

  const conversationId = randomUUID();
  const conversationName = await generateConversationName(message);

  await insertConversation({
    id: conversationId,
    userId,
    name: conversationName,
    model,
  });

  const encodedMessage = Buffer.from(message).toString("base64");
  redirect(`/conversations/${conversationId}?q=${encodedMessage}&model=${model}`);
}
