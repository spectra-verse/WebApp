import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

const LIBSQL_URL_KEY = "libsql_url";

export function getLibSQLUrl(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(LIBSQL_URL_KEY) ?? "http://localhost:8080";
  }
  return "http://localhost:8080";
}

export function setLibSQLUrl(url: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LIBSQL_URL_KEY, url);
  }
}

let _db: ReturnType<typeof drizzle> | null = null;
let _url: string | null = null;

export function getClientDb() {
  const url = getLibSQLUrl();
  if (!_db || url !== _url) {
    const client = createClient({ url });
    _db = drizzle(client);
    _url = url;
  }
  return _db;
}
