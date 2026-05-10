import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: process.env.LIBSQL_URL ?? "http://localhost:8080",
});

export const db = drizzle(client);
