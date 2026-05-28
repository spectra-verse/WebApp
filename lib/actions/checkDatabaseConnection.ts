import { getClientDb } from "@/lib/client-db";
import { user } from "@/db/schema";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

export async function checkDatabaseConnection(url?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const db = url
      ? drizzle(createClient({ url }))
      : getClientDb();
    await db.select({ id: user.id }).from(user).limit(1);
    return { success: true, message: "Database connected successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}
