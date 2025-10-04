import { useState, useCallback, FormEvent } from "react";
import { Message } from "ai";
import { streamOllamaChat, OllamaMessage } from "@/lib/ollama/clientOllama";
import { saveConversationMessages } from "@/lib/actions/saveConversationMessages";
import { generateUUID } from "@/lib/utils/uuid";

interface UseOllamaChatOptions {
  initialMessages?: Message[];
  body?: {
    model?: string;
    conversationId?: string;
  };
  ollamaUrl: string;
}

export function useOllamaChat({
  initialMessages = [],
  body = {},
  ollamaUrl,
}: UseOllamaChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const append = useCallback(
    async (message: { content: string; role: "user" | "assistant" }) => {
      const newUserMessage: Message = {
        id: generateUUID(),
        role: message.role,
        content: message.content,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      if (message.role === "user") {
        setStatus("streaming");
        setError(null);

        try {
          // Create assistant message placeholder
          const assistantMessageId = generateUUID();
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
          };

          setMessages((prev) => [...prev, assistantMessage]);

          let fullContent = "";

          // Convert messages to Ollama format
          const ollamaMessages: OllamaMessage[] = [
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
            {
              role: "user" as const,
              content: message.content,
            },
          ];

          // Stream the response
          await streamOllamaChat(
            ollamaUrl,
            {
              model: body.model || "deepseek-r1:8b",
              messages: ollamaMessages,
            },
            (chunk, done) => {
              fullContent += chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: fullContent }
                    : m
                )
              );

              // Save messages when streaming is done
              if (done && body.conversationId) {
                saveConversationMessages(
                  message.content,
                  fullContent,
                  body.conversationId
                ).catch((err) => {
                  console.error("Failed to save messages:", err);
                });
              }
            }
          );
        } catch (err) {
          console.error("Chat error:", err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to connect to Ollama. Please check your settings.";
          setError(errorMessage);

          // Add error message
          setMessages((prev) => [
            ...prev,
            {
              id: generateUUID(),
              role: "assistant",
              content: `Error: ${errorMessage}`,
            },
          ]);
        } finally {
          setStatus("idle");
        }
      }
    },
    [messages, ollamaUrl, body]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!input.trim()) return;

      const userMessage = input;
      setInput("");

      await append({
        content: userMessage,
        role: "user",
      });
    },
    [input, append]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    status,
    error,
  };
}
