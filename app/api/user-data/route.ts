import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllConversations } from "@/lib/db/conversations";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all conversations for this user
    const conversations = await getAllConversations(userId);

    // Fetch all messages for this user
    const userMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(asc(messages.createdAt));

    // Convert timestamps to ISO strings
    const messagesFormatted = userMessages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      conversations,
      messages: messagesFormatted,
    });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
