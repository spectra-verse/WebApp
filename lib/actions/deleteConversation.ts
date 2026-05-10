import { deleteConversation as dbDeleteConversation } from "@/lib/db/conversations";
import { getClientUserId } from "@/lib/client-local-user";

export async function deleteConversation(conversationId: string) {
  const userId = await getClientUserId();

  try {
    return await dbDeleteConversation(conversationId, userId);
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw new Error("Failed to delete conversation");
  }
}
