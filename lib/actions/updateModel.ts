"use server";

import { updateConversationModel } from "@/lib/db/conversations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateModel(conversationId: string, model: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    return updateConversationModel(conversationId, session.user.id, model);
  } catch (error) {
    console.error("Failed to update conversation model:", error);
    throw new Error("Failed to update model");
  }
}
