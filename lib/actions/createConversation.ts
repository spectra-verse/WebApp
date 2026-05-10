import { insertConversation } from "@/lib/db/conversations";
import { generateUUID } from "@/lib/utils/uuid";
import { getClientUserId } from "@/lib/client-local-user";

function generateConversationName(userMessage: string) {
  return `${userMessage.substring(0, 15)}...`;
}

export async function createConversation(
  message: string,
  model: string
): Promise<{ conversationId: string; encodedMessage: string; model: string }> {
  const userId = await getClientUserId();

  const conversationId = generateUUID();
  const conversationName = generateConversationName(message);

  await insertConversation({
    id: conversationId,
    userId,
    name: conversationName,
    model,
  });

  const encodedMessage = Buffer.from(message).toString("base64");
  return { conversationId, encodedMessage, model };
}
