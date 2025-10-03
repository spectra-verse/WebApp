import { useState, useEffect } from "react";
import { fetchClientOllamaModels } from "@/lib/ollama/clientOllama";
import { OllamaModel } from "@/lib/ollama/client";

export type FormattedModel = {
  value: string;
  label: string;
};

// Fallback models to use if fetching from Ollama fails
const fallbackModels = [
  { value: "llama3.2", label: "Llama 3.2" },
  { value: "phi4", label: "Phi-4" },
  { value: "deepseek-r1:8b", label: "DeepSeek 8B" },
  { value: "deepseek-r1:1.5b", label: "DeepSeek 1.5B" },
  { value: "gemma2", label: "Gemma 2" },
];

export function useOllamaModels(ollamaUrl?: string) {
  const [models, setModels] = useState<FormattedModel[]>(fallbackModels);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      // If no ollamaUrl is provided, use fallback models
      if (!ollamaUrl) {
        setIsLoading(false);
        console.log(`no url provided`);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const ollamaModels = await fetchClientOllamaModels(ollamaUrl);
        console.log("models ", ollamaModels);
        if (ollamaModels.length > 0) {
          const formattedModels = ollamaModels.map((model: OllamaModel) => ({
            value: model.name,
            label: formatModelName(model.name),
          }));
          setModels(formattedModels);
        } else {
          // If no models returned from Ollama, keep using fallback models
          console.log("No models found from Ollama, using fallback models");
        }
      } catch (err) {
        setError("Failed to load models from Ollama");
        console.error(err);
        // Keep the fallback models in case of error
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, [ollamaUrl]);

  return { models, isLoading, error };
}

// Helper to format model names into more readable labels
function formatModelName(name: string): string {
  // Remove tags like :latest
  const baseName = name.split(":")[0];

  // Convert kebab-case or snake_case to Title Case
  return baseName
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
