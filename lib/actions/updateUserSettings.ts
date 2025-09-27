"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function updateUserSettings(ollamaUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const updatedSettings = await db
      .update(userSettings)
      .set({
        ollamaUrl,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, session.user.id))
      .returning();

    if (updatedSettings.length === 0) {
      throw new Error("Settings not found");
    }

    return {
      success: true,
      settings: updatedSettings[0],
    };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    throw new Error("Failed to update settings");
  }
}