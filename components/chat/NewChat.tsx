"use client";

import { useModelSelection } from "@/hooks/useModelSelection";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import ChatSubmit from "./ChatSubmit";
import ModelSelector from "./ModelSelector";
import PromptCard from "./PromptCard";
import { useSidebar } from "../providers/sidebar-provider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { promptCards } from "@/lib/data/promptCards";

export default function NewChat() {
  const { isCollapsed } = useSidebar();
  const [input, setInput] = useState("");
  const [showAllCards, setShowAllCards] = useState(false);
  const { selectedModel, setSelectedModel, models, isLoading } =
    useModelSelection();

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setInput(e.target.value);
  }

  function handlePromptClick(promptText: string) {
    setInput(promptText);
  }

  function toggleShowAllCards() {
    setShowAllCards(!showAllCards);
  }


  return (
    <main className="h-full flex items-center justify-center px-4 bg-background text-foreground">
      <div className={`w-full ${isCollapsed ? "max-w-5xl" : "max-w-4xl"}`}>
        <div className="flex justify-center items-center">
          <Image src="/logo_1.png" width={60} height={60} alt="Spectraverse" />
        </div>
        <h1 className="text-3xl text-center mt-8 font-medium mb-12 text-foreground">
          Choose a prompt or start typing
        </h1>
        <ModelSelector
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          models={models}
          isLoading={isLoading}
        />
        <ChatSubmit
          input={input}
          isNewChat
          handleInputChange={handleInputChange}
          selectedModel={selectedModel}
        />
        {/* Prompt Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-2">
          {(showAllCards ? promptCards : promptCards.slice(0, 3)).map(
            (card) => (
              <PromptCard
                key={card.id}
                title={card.title}
                subtitle={card.subtitle}
                promptText={card.promptText}
                icon={card.icon}
                iconBgColor={card.iconBgColor}
                iconHoverColor={card.iconHoverColor}
                iconTextColor={card.iconTextColor}
                onClick={handlePromptClick}
              />
            ),
          )}
        </div>

        {/* More/Less Button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            onClick={toggleShowAllCards}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            {showAllCards ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                More
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
