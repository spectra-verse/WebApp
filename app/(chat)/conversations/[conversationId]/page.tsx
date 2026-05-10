import { Suspense } from "react";
import { notFound } from "next/navigation";
import Chat from "@/components/chat/Chat";
import { getConversation, getConversationMessages } from "@/lib/db/conversations";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import { getLocalUserId } from "@/lib/local-user";
import { Message as AIMessage } from "ai";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const userId = await getLocalUserId();
  const { conversationId } = await params;

  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    notFound();
  }

  const messages = await getConversationMessages(conversationId, userId);
  const settings = await getUserSettings();

  const messagesMapped: AIMessage[] = messages.map((m) => ({
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
        showSidebar={true}
        ollamaUrl={settings.ollamaUrl}
      />
    </Suspense>
  );
}
