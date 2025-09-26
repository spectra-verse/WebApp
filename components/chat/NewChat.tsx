"use client";

import { useModelSelection } from "@/hooks/useModelSelection";
import { Bug, Code2, Eye, FileText, TestTube, Zap } from "lucide-react";
import { useState } from "react";
import ChatSubmit from "./ChatSubmit";
import ModelSelector from "./ModelSelector";
import PromptCard from "./PromptCard";
import { useSidebar } from "../providers/sidebar-provider";
import Image from "next/image";

export default function NewChat() {
  const { isCollapsed } = useSidebar();
  const [input, setInput] = useState("");
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

  const promptCards = [
    {
      id: "code-explanation",
      title: "Code Explanation",
      subtitle: "Get detailed code explanations",
      promptText: "Explain this code to me.",
      icon: <Code2 className="w-5 h-5" />,
      iconBgColor: "bg-blue-100",
      iconHoverColor: "group-hover:bg-blue-200",
      iconTextColor: "text-blue-600",
    },
    {
      id: "optimization",
      title: "Optimization",
      subtitle: "Optimize your text or code",
      promptText: "Optimize this text for me.",
      icon: <Zap className="w-5 h-5" />,
      iconBgColor: "bg-green-100",
      iconHoverColor: "group-hover:bg-green-200",
      iconTextColor: "text-green-600",
    },
    {
      id: "bug-finding",
      title: "Bug Finding",
      subtitle: "Can you help me find bug in this code",
      promptText: "Can you help me find bug in this code.",
      icon: <Bug className="w-5 h-5" />,
      iconBgColor: "bg-red-100",
      iconHoverColor: "group-hover:bg-red-200",
      iconTextColor: "text-red-600",
    },
    {
      id: "code-review",
      title: "Code Review",
      subtitle: "Please review this code and suggest improvements",
      promptText: "Please review this code and suggest improvements.",
      icon: <Eye className="w-5 h-5" />,
      iconBgColor: "bg-purple-100",
      iconHoverColor: "group-hover:bg-purple-200",
      iconTextColor: "text-purple-600",
    },
    {
      id: "documentation",
      title: "Documentation",
      subtitle: "Help me write documentation for this",
      promptText: "Help me write documentation for this.",
      icon: <FileText className="w-5 h-5" />,
      iconBgColor: "bg-orange-100",
      iconHoverColor: "group-hover:bg-orange-200",
      iconTextColor: "text-orange-600",
    },
    {
      id: "testing",
      title: "Testing",
      subtitle: "How can I write tests for this",
      promptText: "How can I write tests for this.",
      icon: <TestTube className="w-5 h-5" />,
      iconBgColor: "bg-cyan-100",
      iconHoverColor: "group-hover:bg-cyan-200",
      iconTextColor: "text-cyan-600",
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-6">
          {promptCards.map((card) => (
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
          ))}
        </div>
      </div>
    </main>
  );
}
