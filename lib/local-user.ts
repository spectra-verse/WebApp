import { db } from "@/db";
import { user } from "@/db/schema";
import { randomUUID } from "crypto";

let cachedUserId: string | null = null;

export async function getLocalUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  const existing = await db.select({ id: user.id }).from(user).limit(1);
  if (existing.length > 0) {
    cachedUserId = existing[0].id;
    return cachedUserId;
  }

  const id = randomUUID();
  const now = new Date();
  await db.insert(user).values({ id, createdAt: now, updatedAt: now });
  cachedUserId = id;
  return id;
}
