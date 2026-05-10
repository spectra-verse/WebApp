"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLocalUserId } from "@/lib/local-user";

export async function getUserData() {
  const userId = await getLocalUserId();

  const userData = await db
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
