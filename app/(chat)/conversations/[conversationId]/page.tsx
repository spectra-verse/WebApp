import { Suspense } from "react";
import Chat from "@/components/chat/Chat";
import {
  getConversation,
  getConversationMessages,
} from "@/lib/db/conversations";
import { Message } from "ai";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;
  const messages = getConversationMessages(conversationId);
  const conversation = getConversation(conversationId);

  const messagesMapped: Message[] = messages.map((m) => ({
    id: m.id,
    content: m.content,
    role: m.role,
    createdAt: new Date(m.createdAt),
  }));

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <Chat
        initialMessages={messagesMapped}
        conversationId={conversationId}
        initialModel={conversation?.model}
      />
    </Suspense>
  );
}
