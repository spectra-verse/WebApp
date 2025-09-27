"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function exportUserData() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // This is a dummy implementation for now
  // In the future, this would generate and return actual SQLite data
  return {
    success: true,
    message: "Data export functionality coming soon!",
    downloadUrl: null, // Will be implemented later
  };
}