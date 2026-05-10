import { getClientDb } from "@/lib/client-db";
import { user } from "@/db/schema";

export async function checkDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await getClientDb().select({ id: user.id }).from(user).limit(1);
    return { success: true, message: "Database connected successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}
