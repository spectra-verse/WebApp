import { NextResponse } from "next/server";
import { getAllConversations } from "@/lib/db/conversations";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getLocalUserId } from "@/lib/local-user";

export async function GET() {
  try {
    const userId = await getLocalUserId();

    const conversations = await getAllConversations(userId);

    const userMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(asc(messages.createdAt));

    const messagesFormatted = userMessages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({ conversations, messages: messagesFormatted });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
