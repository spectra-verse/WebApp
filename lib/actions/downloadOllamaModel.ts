"use server";

import { getUserSettings } from "./getUserSettings";

export async function downloadOllamaModel(modelName: string) {
  try {
    const settings = await getUserSettings();
    const baseUrl = settings.ollamaUrl.replace("/v1", "");

    const response = await fetch(`${baseUrl}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modelName,
        stream: false,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download model: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      message: `Model "${modelName}" downloaded successfully`,
    };
  } catch (error) {
    console.error("Error downloading model:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}