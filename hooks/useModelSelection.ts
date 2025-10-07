import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOllamaModels } from "./useOllamaModels";
import { updateModel } from "@/lib/actions/updateModel";

export function useModelSelection(initialModel?: string, ollamaUrl?: string) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { models, isLoading, error, connectionError } = useOllamaModels(ollamaUrl);
  const conversationId = pathname?.split("/").pop();
  const lastSyncedModelRef = useRef<string | null>(null);

  // Initialize model from URL, then initial model param, then default
  const [selectedModel, setSelectedModel] = useState(() => {
    const modelFromUrl = searchParams?.get("model");
    return modelFromUrl || initialModel || "llama3.2";
  });

  // Ensure selectedModel exists in our models list
  useEffect(() => {
    if (!isLoading && models.length > 0) {
      setSelectedModel((current) => {
        const modelExists = models.some((model) => model.value === current);
        if (!modelExists) {
          // If current selection isn't available, use first model
          return models[0].value;
        }
        return current;
      });
    }
  }, [isLoading, models]);

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

  // Sync URL with selected model - only when selectedModel actually changes
  useEffect(() => {
    if (pathname && router && searchParams) {
      const currentModelParam = searchParams.get("model");

      // Only update URL if:
      // 1. The model param in URL differs from selectedModel
      // 2. We haven't just synced this exact model (prevents loops)
      if (currentModelParam !== selectedModel && lastSyncedModelRef.current !== selectedModel) {
        lastSyncedModelRef.current = selectedModel;
        const current = new URLSearchParams(searchParams.toString());
        current.set("model", selectedModel);
        router.replace(`${pathname}?${current.toString()}`);
      }
    }
  }, [selectedModel, pathname, router, searchParams]);

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
    models,
    isLoading,
    error,
    connectionError,
  };
}
