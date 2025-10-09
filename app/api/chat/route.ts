import { insertConversationMessages } from "@/lib/db/messages";
import { updateConversationModel, getConversation } from "@/lib/db/conversations";
import { getUserOllamaClient } from "@/lib/ollama/getUserOllamaClient";
import { streamText } from "ai";
import { randomUUID } from "crypto";
import { MessageData } from "@/lib/db/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const { messages, model, conversationId } = await req.json();

  if (!conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }

  // Verify user owns this conversation
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    return new Response("Conversation not found or unauthorized", { status: 404 });
  }

  // Ensure the conversation has the most recent model saved
  try {
    await updateConversationModel(conversationId, userId, model);
  } catch (error) {
    console.error("Failed to update conversation model:", error);
    // Continue processing the message even if model update fails
  }

  const lastUserMsg = messages[(messages?.length ?? 1) - 1];

  try {
    const userOllama = await getUserOllamaClient();

    const result = streamText({
      model: userOllama(model || "deepseek-r1:8b"),
      messages,
      onFinish: async (event) => {
        await saveMessages(lastUserMsg, event.text, conversationId, userId);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function saveMessages(
  userMessage: MessageData,
  assistantMessage: string,
  conversationId: string,
  userId: string,
) {
  const messages: MessageData[] = [
    {
      content: userMessage.content,
      role: userMessage.role,
      conversationId,
      userId,
      id: randomUUID(),
    },
    {
      content: assistantMessage,
      conversationId: conversationId,
      userId,
      id: randomUUID(),
      role: "assistant",
    },
  ];

  await insertConversationMessages(messages);
}
