import { useState, useEffect } from "react";
import { fetchClientOllamaModelDetails } from "@/lib/ollama/clientOllama";

export interface ModelDetails {
  modelfile?: string;
  parameters?: string;
  template?: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
  model_info?: {
    [key: string]: unknown;
  };
}

export function useModelDetails(modelName?: string, ollamaUrl?: string) {
  const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModelDetails() {
      // If no model name or URL provided, clear the details
      if (!modelName || !ollamaUrl) {
        setModelDetails(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const details = await fetchClientOllamaModelDetails(ollamaUrl, modelName);
        setModelDetails(details);
      } catch (err) {
        setError("Failed to load model details");
        console.error("Error fetching model details:", err);
        setModelDetails(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadModelDetails();
  }, [modelName, ollamaUrl]);

  return { modelDetails, isLoading, error };
}
