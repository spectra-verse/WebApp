"use server";

import { updateConversationName } from "../db/conversations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function renameConversation(
  conversationId: string,
  newName: string
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    updateConversationName(conversationId, session.user.id, newName);
    return { success: true };
  } catch (error) {
    console.error("Failed to rename conversation:", error);
    throw new Error("Failed to rename conversation");
  }
}
