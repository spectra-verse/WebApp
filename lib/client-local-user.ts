import { getClientDb } from "@/lib/client-db";
import { user } from "@/db/schema";
import { generateUUID } from "@/lib/utils/uuid";
import { eq } from "drizzle-orm";

const USER_ID_KEY = "local_user_id";

let cachedUserId: string | null = null;

export async function getClientUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(USER_ID_KEY);
    if (stored) {
      const db = getClientDb();
      const verified = await db.select({ id: user.id }).from(user).where(eq(user.id, stored)).limit(1);
      if (verified.length > 0) {
        cachedUserId = stored;
        return cachedUserId;
      }
      localStorage.removeItem(USER_ID_KEY);
    }
  }

  const db = getClientDb();
  const existing = await db.select({ id: user.id }).from(user).limit(1);

  if (existing.length > 0) {
    cachedUserId = existing[0].id;
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_ID_KEY, cachedUserId);
    }
    return cachedUserId;
  }

  const id = generateUUID();
  const now = new Date();
  await db.insert(user).values({ id, createdAt: now, updatedAt: now });

  cachedUserId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_ID_KEY, id);
  }
  return cachedUserId;
}
