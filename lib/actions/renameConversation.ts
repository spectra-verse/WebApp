"use server";

import { updateConversationName } from "../db/conversations";

export async function renameConversation(
  conversationId: string,
  newName: string
) {
  try {
    updateConversationName(conversationId, newName);
    return { success: true };
  } catch (error) {
    console.error("Failed to rename conversation:", error);
    throw new Error("Failed to rename conversation");
  }
}
