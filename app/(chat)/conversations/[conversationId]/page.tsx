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
import { Message as AIMessage } from "ai";
import { Message, Conversation } from "@/lib/db/types";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

async function getConversationData(
  conversationId: string,
  userId: string
): Promise<Conversation | undefined> {
  const useLocalProxy = process.env.NEXT_PUBLIC_USE_LOCAL_PROXY === "true";
  const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8080";
  const localUserId = process.env.NEXT_PUBLIC_LOCAL_USER_ID || "local-user";

  if (useLocalProxy) {
    // Fetch from local proxy
    try {
      const response = await fetch(
        `${proxyUrl}/api/conversations/${conversationId}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        console.error("Failed to fetch conversation from proxy");
        return undefined;
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching conversation from proxy:", error);
      return undefined;
    }
  } else {
    // Cloud mode: use PostgreSQL
    return getConversation(conversationId, userId);
  }
}

async function getMessagesData(
  conversationId: string,
  userId: string
): Promise<Message[]> {
  const useLocalProxy = process.env.NEXT_PUBLIC_USE_LOCAL_PROXY === "true";
  const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8080";
  const localUserId = process.env.NEXT_PUBLIC_LOCAL_USER_ID || "local-user";

  if (useLocalProxy) {
    // Fetch from local proxy
    try {
      const response = await fetch(
        `${proxyUrl}/api/conversations/${conversationId}/messages`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        console.error("Failed to fetch messages from proxy");
        return [];
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching messages from proxy:", error);
      return [];
    }
  } else {
    // Cloud mode: use PostgreSQL
    return getConversationMessages(conversationId, userId);
  }
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
  const conversation = await getConversationData(conversationId, user.id);

  // If conversation doesn't exist or user doesn't own it, show 404
  if (!conversation) {
    notFound();
  }

  const messages = await getMessagesData(conversationId, user.id);
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
        email={user?.email}
        ollamaUrl={settings.ollamaUrl}
      />
    </Suspense>
  );
}
