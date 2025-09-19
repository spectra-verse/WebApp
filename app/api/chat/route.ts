import { insertConversationMessages } from "@/lib/db/messages";
import { updateConversationModel } from "@/lib/db/conversations";
import { ollama } from "@/lib/ollama/client";
import { streamText } from "ai";
import { randomUUID } from "crypto";
import { MessageData } from "@/lib/db/types";

export async function POST(req: Request) {
  const { messages, model, conversationId } = await req.json();

  if (!conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }

  // Ensure the conversation has the most recent model saved
  try {
    updateConversationModel(conversationId, model);
  } catch (error) {
    console.error("Failed to update conversation model:", error);
    // Continue processing the message even if model update fails
  }

  const lastUserMsg = messages[(messages?.length ?? 1) - 1];

  try {
    const result = streamText({
      model: ollama(model || "deepseek-r1:8b"),
      messages,
      onFinish: async (event) => {
        await saveMessages(lastUserMsg, event.text, conversationId);
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
) {
  const messages: MessageData[] = [
    {
      content: userMessage.content,
      role: userMessage.role,
      conversationId,
      id: randomUUID(),
    },
    {
      content: assistantMessage,
      conversationId: conversationId,
      id: randomUUID(),
      role: "assistant",
    },
  ];

  insertConversationMessages(messages);
}
