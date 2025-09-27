"use server";

import { getUserSettings } from "./getUserSettings";

export async function deleteOllamaModel(modelName: string) {
  try {
    const settings = await getUserSettings();
    const baseUrl = settings.ollamaUrl.replace("/v1", "");

    const response = await fetch(`${baseUrl}/api/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: "Model not found or already deleted",
        };
      }
      return {
        success: false,
        error: `Failed to delete model: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      message: `Model "${modelName}" deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting model:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}