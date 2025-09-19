"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createConversation } from "@/lib/actions/createConversation";
import { Loader, Send } from "lucide-react";
import { ChatRequestOptions } from "ai";
import { useRef, useTransition } from "react";

interface ChatSubmitProps {
  handleInputChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  input: string;
  selectedModel?: string;
  isStreaming?: boolean;
  isNewChat?: boolean;
  handleSubmit?: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
}

export default function ChatSubmit({
  input,
  handleInputChange,
  isStreaming = false,
  isNewChat = false,
  selectedModel,
  handleSubmit,
}: ChatSubmitProps) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedModel || !input) {
      return;
    }

    if (isNewChat && selectedModel) {
      startTransition(() => {
        createConversation(input, selectedModel);
      });
    } else if (handleSubmit) {
      handleSubmit(e);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-auto relative">
      <div className="relative">
        <Textarea
          className="w-full text-lg bg-background"
          placeholder="Say something"
          onKeyDown={handleKeyDown}
          disabled={pending}
          name="message"
          value={input}
          onChange={handleInputChange}
        />
        {pending && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={pending || !input || !selectedModel || isStreaming}
        className="absolute top-1/2 transform -translate-y-1/2 right-4 rounded-full disabled:opacity-50"
      >
        <Send size={24} />
      </Button>
    </form>
  );
}
