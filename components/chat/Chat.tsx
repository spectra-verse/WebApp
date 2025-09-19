"use client";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Message as MessageType } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";
import ChatSubmit from "./ChatSubmit";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Message from "./Message";
import ModelSelector from "./ModelSelector";
import { useModelSelection } from "@/hooks/useModelSelection";

interface ChatProps {
  initialMessages?: MessageType[];
  conversationId: string;
  initialModel?: string;
}

export default function Chat({
  initialMessages = [],
  conversationId,
  initialModel,
}: ChatProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const {
    selectedModel,
    setSelectedModel,
    models,
    isLoading: modelsLoading,
  } = useModelSelection(initialModel);

  const { messages, handleSubmit, input, handleInputChange, append, status } =
    useChat({
      body: {
        model: selectedModel,
        conversationId: conversationId,
      },
      initialMessages: initialMessages,
    });

  const isLoading = status === "streaming";

  const { messagesEndRef, handleScroll } = useAutoScroll({
    dependencies: messages,
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      try {
        // Decode the base64 encoded message
        const decodedMessage = Buffer.from(q, "base64").toString();

        append({
          content: decodedMessage,
          role: "user",
        });
      } catch (error) {
        console.error("Error decoding message:", error);
        // Fallback to using the raw parameter if decoding fails
        append({
          content: q,
          role: "user",
        });
      }

      // Remove the q parameter from URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("q");
      router.replace(
        `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`
      );
    }
  }, [searchParams, append, router, pathname]);

  // URL sync is now handled by the useModelSelection hook

  return (
    <main className="bg-muted w-full h-screen">
      <div className="container h-full w-full flex flex-col p-8">
        <ModelSelector
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          models={models}
          isLoading={modelsLoading}
        />
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ChatSubmit
          handleInputChange={handleInputChange}
          isStreaming={isLoading}
          input={input}
          handleSubmit={handleSubmit}
          selectedModel={selectedModel}
        />
      </div>
    </main>
  );
}
