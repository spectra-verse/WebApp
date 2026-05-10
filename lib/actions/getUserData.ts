import { getClientDb } from "@/lib/client-db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClientUserId } from "@/lib/client-local-user";

export async function getUserData() {
  const userId = await getClientUserId();

  const userData = await getClientDb()
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData.length) {
    throw new Error("User not found");
  }

  return userData[0];
}
