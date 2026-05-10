import { insertConversationMessages } from "@/lib/db/messages";
import { updateConversationModel, getConversation } from "@/lib/db/conversations";
import { getUserOllamaClient } from "@/lib/ollama/getUserOllamaClient";
import { streamText } from "ai";
import { randomUUID } from "crypto";
import { MessageData } from "@/lib/db/types";
import { getLocalUserId } from "@/lib/local-user";

export async function POST(req: Request) {
  const userId = await getLocalUserId();
  const { messages, model, conversationId } = await req.json();

  if (!conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }

  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  try {
    await updateConversationModel(conversationId, userId, model);
  } catch (error) {
    console.error("Failed to update conversation model:", error);
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
      conversationId,
      userId,
      id: randomUUID(),
      role: "assistant",
    },
  ];

  await insertConversationMessages(messages);
}
