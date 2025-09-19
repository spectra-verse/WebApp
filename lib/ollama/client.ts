import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const OLLAMA_BASE_URL = "http://localhost:11434/v1";

export const ollama = createOpenAICompatible({
  baseURL: OLLAMA_BASE_URL,
  name: "ollama",
});

export type OllamaModel = {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
};

export async function fetchOllamaModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(
      `${OLLAMA_BASE_URL.replace("/v1", "")}/api/tags`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    return [];
  }
}
