import { updateConversationName } from "../db/conversations";
import { getClientUserId } from "@/lib/client-local-user";

export async function renameConversation(conversationId: string, newName: string) {
  const userId = await getClientUserId();

  try {
    await updateConversationName(conversationId, userId, newName);
    return { success: true };
  } catch (error) {
    console.error("Failed to rename conversation:", error);
    throw new Error("Failed to rename conversation");
  }
}
