import { getClientDb } from "@/lib/client-db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClientUserId } from "@/lib/client-local-user";

export async function updateUserSettings(ollamaUrl: string) {
  const userId = await getClientUserId();

  try {
    await getClientDb()
      .update(userSettings)
      .set({ ollamaUrl, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    throw new Error("Failed to update settings");
  }
}
