"use server";

import { deleteConversation as dbDeleteConversation } from "@/lib/db/conversations";
import { getLocalUserId } from "@/lib/local-user";

export async function deleteConversation(conversationId: string) {
  const userId = await getLocalUserId();

  try {
    return await dbDeleteConversation(conversationId, userId);
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw new Error("Failed to delete conversation");
  }
}
