"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function getUserSettings() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  if (settings.length === 0) {
    const newSettings = {
      id: randomUUID(),
      userId: session.user.id,
      ollamaUrl: "http://localhost:11434/v1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userSettings).values(newSettings);
    return newSettings;
  }

  return settings[0];
}