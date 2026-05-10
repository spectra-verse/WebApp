"use server";

import { updateConversationModel } from "@/lib/db/conversations";
import { getLocalUserId } from "@/lib/local-user";

export async function updateModel(conversationId: string, model: string) {
  const userId = await getLocalUserId();

  try {
    return updateConversationModel(conversationId, userId, model);
  } catch (error) {
    console.error("Failed to update conversation model:", error);
    throw new Error("Failed to update model");
  }
}
