import { useState, useEffect } from "react";
import { fetchClientOllamaModels } from "@/lib/ollama/clientOllama";
import { OllamaModel } from "@/lib/ollama/client";

export type FormattedModel = {
  value: string;
  label: string;
};

export function useOllamaModels(ollamaUrl?: string) {
  const [models, setModels] = useState<FormattedModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    async function loadModels() {
      // If no ollamaUrl is provided, mark as error
      if (!ollamaUrl) {
        setIsLoading(false);
        setConnectionError(true);
        setError("No Ollama URL configured");
        console.log("No Ollama URL provided");
        return;
      }

      setIsLoading(true);
      setError(null);
      setConnectionError(false);

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
          // No models installed
          setModels([]);
          setError("No models installed in Ollama");
          console.log("No models found in Ollama");
        }
      } catch (err) {
        setConnectionError(true);
        setError("Failed to connect to Ollama");
        console.error(err);
        setModels([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, [ollamaUrl]);

  return { models, isLoading, error, connectionError };
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
