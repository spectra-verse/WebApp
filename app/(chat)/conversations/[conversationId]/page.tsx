import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Chat from "@/components/chat/Chat";
import {
  getConversation,
  getConversationMessages,
} from "@/lib/db/conversations";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import { Message } from "ai";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user?.id) {
    redirect("/");
  }

  const { conversationId } = await params;
  const conversation = getConversation(conversationId, user.id);

  // If conversation doesn't exist or user doesn't own it, show 404
  if (!conversation) {
    notFound();
  }

  const messages = getConversationMessages(conversationId, user.id);
  const settings = await getUserSettings();

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
        showSidebar={true}
        email={user?.email}
        ollamaUrl={settings.ollamaUrl}
      />
    </Suspense>
  );
}
