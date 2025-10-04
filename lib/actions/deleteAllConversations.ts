"use server";

import { deleteAllUserConversations } from "@/lib/db/conversations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function deleteAllConversations() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    deleteAllUserConversations(session.user.id);
    return { success: true, message: "All chat history deleted successfully" };
  } catch (error) {
    console.error("Failed to delete all conversations:", error);
    throw new Error("Failed to delete chat history");
  }
}
