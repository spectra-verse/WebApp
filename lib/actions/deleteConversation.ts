"use server";

import { deleteConversation as dbDeleteConversation } from "@/lib/db/conversations";

export async function deleteConversation(conversationId: string) {
  try {
    return dbDeleteConversation(conversationId);
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw new Error("Failed to delete conversation");
  }
}
