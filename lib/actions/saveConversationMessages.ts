import { insertConversationMessages } from "@/lib/db/messages";
import { getConversation } from "@/lib/db/conversations";
import { MessageData } from "@/lib/db/types";
import { generateUUID } from "@/lib/utils/uuid";
import { getClientUserId } from "@/lib/client-local-user";

export async function saveConversationMessages(
  userMessageContent: string,
  assistantMessageContent: string,
  conversationId: string
) {
  const userId = await getClientUserId();

  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages: MessageData[] = [
    {
      content: userMessageContent,
      role: "user",
      conversationId,
      userId,
      id: generateUUID(),
    },
    {
      content: assistantMessageContent,
      conversationId,
      userId,
      id: generateUUID(),
      role: "assistant",
    },
  ];

  await insertConversationMessages(messages);
}
