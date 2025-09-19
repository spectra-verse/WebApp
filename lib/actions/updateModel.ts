"use server";

import { updateConversationModel } from "@/lib/db/conversations";

export async function updateModel(conversationId: string, model: string) {
  try {
    return updateConversationModel(conversationId, model);
  } catch (error) {
    console.error("Failed to update conversation model:", error);
    throw new Error("Failed to update model");
  }
}
