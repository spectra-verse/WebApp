import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOllamaModels } from "./useOllamaModels";
import { updateModel } from "@/lib/actions/updateModel";

export function useModelSelection(initialModel?: string) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { models, isLoading } = useOllamaModels();
  const conversationId = pathname?.split("/").pop();

  // Initialize model from URL, then initial model param, then default
  const [selectedModel, setSelectedModel] = useState(() => {
    const modelFromUrl = searchParams?.get("model");
    return modelFromUrl || initialModel || "llama3.2";
  });

  // Ensure selectedModel exists in our models list
  useEffect(() => {
    if (!isLoading && models.length > 0) {
      const modelExists = models.some((model) => model.value === selectedModel);
      if (!modelExists) {
        // If current selection isn't available, use first model
        setSelectedModel(models[0].value);
      }
    }
  }, [isLoading, models, selectedModel]);

  // Handle model changes and update database
  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);

    // Update the model in the database if we're on a conversation page
    if (conversationId && pathname?.includes("/conversations/")) {
      updateModel(conversationId, newModel).catch((error) => {
        console.error("Failed to update conversation model:", error);
      });
    }
  };

  // Sync URL with selected model
  useEffect(() => {
    if (pathname && router && searchParams) {
      const current = new URLSearchParams(searchParams.toString());
      if (current.get("model") !== selectedModel) {
        current.set("model", selectedModel);
        router.replace(`${pathname}?${current.toString()}`);
      }
    }
  }, [selectedModel, searchParams, router, pathname]);

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
    models,
    isLoading,
  };
}
