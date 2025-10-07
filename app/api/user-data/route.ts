import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllConversations } from "@/lib/db/conversations";
import { db } from "@/lib/db/init";
import { Message } from "@/lib/db/types";

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
    const conversations = getAllConversations(userId);

    // Fetch all messages for this user
    const stmt = db.prepare(
      "SELECT * FROM messages WHERE userId = ? ORDER BY createdAt ASC"
    );
    const messages = stmt.all(userId) as Message[];

    return NextResponse.json({
      conversations,
      messages,
    });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
