import { deleteAllUserConversations } from "@/lib/db/conversations";
import { getClientUserId } from "@/lib/client-local-user";

export async function deleteAllConversations() {
  const userId = await getClientUserId();

  try {
    await deleteAllUserConversations(userId);
    return { success: true, message: "All chat history deleted successfully" };
  } catch (error) {
    console.error("Failed to delete all conversations:", error);
    throw new Error("Failed to delete chat history");
  }
}
