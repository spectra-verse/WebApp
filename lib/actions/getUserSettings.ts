import { getClientDb } from "@/lib/client-db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateUUID } from "@/lib/utils/uuid";
import { getClientUserId } from "@/lib/client-local-user";

export async function getUserSettings() {
  const userId = await getClientUserId();

  const settings = await getClientDb()
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (settings.length === 0) {
    const newSettings = {
      id: generateUUID(),
      userId,
      ollamaUrl: "http://localhost:11434/v1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await getClientDb().insert(userSettings).values(newSettings);
    } catch {
      const existing = await getClientDb()
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);
      if (existing.length > 0) return existing[0];
    }
    return newSettings;
  }

  return settings[0];
}
