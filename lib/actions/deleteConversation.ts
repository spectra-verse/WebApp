"use server";

import { deleteConversation as dbDeleteConversation } from "@/lib/db/conversations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function deleteConversation(conversationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    return await dbDeleteConversation(conversationId, session.user.id);
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw new Error("Failed to delete conversation");
  }
}
