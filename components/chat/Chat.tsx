"use client";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Message as MessageType } from "ai";
import { useOllamaChat } from "@/hooks/useOllamaChat";
import { useEffect, useRef } from "react";
import ChatSubmit from "./ChatSubmit";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Message from "./Message";
import ModelSelector from "./ModelSelector";
import ModelInfoSidebar from "./ModelInfoSidebar";
import { useModelSelection } from "@/hooks/useModelSelection";

interface ChatProps {
  initialMessages?: MessageType[];
  conversationId: string;
  initialModel?: string;
  showSidebar?: boolean;
  email?: string;
  ollamaUrl: string;
}

export default function Chat({
  initialMessages = [],
  conversationId,
  initialModel,
  showSidebar = false,
  email,
  ollamaUrl,
}: ChatProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const processedQueryRef = useRef(false);

  const {
    selectedModel,
    setSelectedModel,
    models,
    isLoading: modelsLoading,
    connectionError,
  } = useModelSelection(initialModel, ollamaUrl);

  // Redirect to settings if Ollama is not accessible or no models installed
  useEffect(() => {
    if (!modelsLoading) {
      if (connectionError) {
        router.push("/settings?reason=no-connection");
      } else if (models.length === 0) {
        router.push("/settings?reason=no-models");
      }
    }
  }, [modelsLoading, models, connectionError, router]);

  const { messages, handleSubmit, input, handleInputChange, append, status } =
    useOllamaChat({
      body: {
        model: selectedModel,
        conversationId: conversationId,
      },
      initialMessages: initialMessages,
      ollamaUrl,
    });

  const isLoading = status === "streaming";

  const { messagesEndRef, handleScroll } = useAutoScroll({
    dependencies: messages,
  });

  // Reset the processed flag when conversationId changes
  useEffect(() => {
    processedQueryRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    const q = searchParams.get("q");
    // Only process if we haven't already processed this query for this conversation
    if (q && !processedQueryRef.current) {
      processedQueryRef.current = true;

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
        `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`,
      );
    }
  }, [searchParams, append, router, pathname]);

  // URL sync is now handled by the useModelSelection hook

  // Show loading state while checking Ollama connection
  if (modelsLoading) {
    return (
      <main className="bg-background w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mb-4"></div>
          <p className="text-muted-foreground">Connecting to Ollama...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background w-full h-full">
      <div className="h-full w-full flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col p-8">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={models}
            isLoading={modelsLoading}
          />

          <div className="flex-1 overflow-y-auto mb-4" onScroll={handleScroll}>
            {messages.map((message) => (
              <Message key={message.id} message={message} email={email!} />
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

        {/* Right Sidebar - Only show if showSidebar is true */}
        {showSidebar && (
          <ModelInfoSidebar
            className="hidden lg:block"
            modelName={selectedModel}
            ollamaUrl={ollamaUrl}
          />
        )}
      </div>
    </main>
  );
}
