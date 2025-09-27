import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getUserSettings } from "@/lib/actions/getUserSettings";

export async function getUserOllamaClient() {
  try {
    const settings = await getUserSettings();

    return createOpenAICompatible({
      baseURL: settings.ollamaUrl,
      name: "ollama",
    });
  } catch (error) {
    console.error("Failed to get user Ollama settings, falling back to default:", error);

    // Fallback to default configuration
    return createOpenAICompatible({
      baseURL: "http://localhost:11434/v1",
      name: "ollama",
    });
  }
}

export async function fetchUserOllamaModels() {
  try {
    const settings = await getUserSettings();
    const baseUrl = settings.ollamaUrl.replace("/v1", "");

    const response = await fetch(`${baseUrl}/api/tags`);

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Error fetching user's Ollama models:", error);
    return [];
  }
}