"use server";

import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getLocalUserId } from "@/lib/local-user";

export async function getUserSettings() {
  const userId = await getLocalUserId();

  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (settings.length === 0) {
    const newSettings = {
      id: randomUUID(),
      userId,
      ollamaUrl: "http://localhost:11434/v1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userSettings).values(newSettings);
    return newSettings;
  }

  return settings[0];
}
