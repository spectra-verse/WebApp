"use server";

import { updateConversationName } from "../db/conversations";
import { getLocalUserId } from "@/lib/local-user";

export async function renameConversation(conversationId: string, newName: string) {
  const userId = await getLocalUserId();

  try {
    await updateConversationName(conversationId, userId, newName);
    return { success: true };
  } catch (error) {
    console.error("Failed to rename conversation:", error);
    throw new Error("Failed to rename conversation");
  }
}
