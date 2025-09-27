"use server";

import { fetchUserOllamaModels } from "@/lib/ollama/getUserOllamaClient";

export async function getOllamaModels() {
  try {
    const models = await fetchUserOllamaModels();
    return {
      success: true,
      models,
    };
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch models",
      models: [],
    };
  }
}