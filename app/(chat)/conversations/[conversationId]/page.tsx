"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Chat from "@/components/chat/Chat";
import { getConversation, getConversationMessages } from "@/lib/db/conversations";
import { getUserSettings } from "@/lib/actions/getUserSettings";
import { getClientUserId } from "@/lib/client-local-user";
import { Conversation } from "@/lib/db/types";
import { Message as AIMessage } from "ai";

interface PageData {
  conversation: Conversation;
  messages: AIMessage[];
  ollamaUrl: string;
}

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const userId = await getClientUserId();

      const [conversation, msgs, settings] = await Promise.all([
        getConversation(conversationId, userId),
        getConversationMessages(conversationId, userId),
        getUserSettings(),
      ]);

      if (!conversation) {
        router.replace("/chat");
        return;
      }

      const messages: AIMessage[] = msgs.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        createdAt: new Date(m.createdAt),
      }));

      setData({ conversation, messages, ollamaUrl: settings.ollamaUrl });
      setLoading(false);
    }
    load();
  }, [conversationId, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!data) return null;

  return (
    <Chat
      initialMessages={data.messages}
      conversationId={conversationId}
      initialModel={data.conversation.model ?? undefined}
      showSidebar={true}
      ollamaUrl={data.ollamaUrl}
    />
  );
}
