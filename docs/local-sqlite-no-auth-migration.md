# Remove Remote DB + Auth: Migrate to Local SQLite with Auto-Generated User ID

## Context
The app currently uses Neon-hosted PostgreSQL and Better-Auth (email/password + GitHub/Google OAuth). The goal is to make this a fully local, single-user app running in Docker alongside Ollama — no remote connections, no login screens. All auth UI and logic is removed. A single user is auto-created in SQLite on first startup and that ID is reused everywhere sessions used to be.

---

## Approach: Auto-Generated Local User
- A new `lib/local-user.ts` utility (`getLocalUserId()`) queries the `user` table for the single row. If none exists, it inserts one with a random UUID. This is called everywhere `auth.api.getSession()` was called.
- No cookies, no sessions, no env vars required for identity — the DB is the source of truth.

---

## Files to Delete
| File | Reason |
|------|--------|
| `lib/auth.ts` | Better-Auth config |
| `lib/auth-client.ts` | Better-Auth React client |
| `lib/actions/auth-actions.tsx` | signIn/signUp/signOut server actions |
| `app/api/auth/[...all]/route.ts` | Auth API route |
| `app/auth/` (directory) | Login/signup page |

---

## Files to Add
| File | Purpose |
|------|---------|
| `lib/local-user.ts` | `getLocalUserId()`: get-or-create the single local user in SQLite |

---

## Files to Modify

### Database / Config
| File | Change |
|------|--------|
| `package.json` | Remove `better-auth`, `@neondatabase/serverless`, `pg`, `@types/pg`; add `better-sqlite3`, `@types/better-sqlite3` |
| `db/index.ts` | Switch to `drizzle-orm/better-sqlite3`; use `SQLITE_DB_PATH ?? ./ollama-next.db`; enable WAL pragma |
| `db/schema.ts` | Remove `session`, `account`, `verification` tables; keep `user` (make `email`/`name` nullable); convert all PG types to SQLite types |
| `drizzle.config.ts` | `dialect: "sqlite"`, `SQLITE_DB_PATH` credential |

### Server Actions (replace `auth.api.getSession()` with `getLocalUserId()`)
All actions in `lib/actions/`: `getUserData.ts`, `getUserSettings.ts`, `updateUserSettings.ts`, `createConversation.ts`, `deleteConversation.ts`, `saveConversationMessages.ts`, `renameConversation.ts`, `updateModel.ts`, `deleteAllConversations.ts`

### API Routes (replace session check + 401 with `getLocalUserId()`)
- `app/api/chat/route.ts`
- `app/api/user-data/route.ts`

### Pages (remove session checks and `/auth` redirects)
- `app/(chat)/chat/page.tsx` — remove auth check; always render
- `app/(chat)/settings/page.tsx` — remove auth check
- `app/(chat)/conversations/[conversationId]/page.tsx` — remove auth check
- `app/(chat)/layout.tsx` — remove `<UserMenu>` or replace with static element
- `app/page.tsx` — remove session prop to `<Navigation>`

### UI Components (remove sign-in/sign-out UI)
- `app/components/ui/Navigation.tsx` — remove sign in/out buttons
- `app/(chat)/chat/ChatClient.tsx` — remove signOut button/redirect
- `components/sidebar/Sidebar.tsx` — replace `auth.api.getSession()` with `getLocalUserId()`
- `components/sidebar/SidebarFooter.tsx` — show "Local User" or remove user display
- `components/ui/UserMenu.tsx` — delete or simplify (no sign-out needed)

---

## Key Implementation Details

### `lib/local-user.ts`
```typescript
import { db } from "@/db";
import { user } from "@/db/schema";
import { randomUUID } from "crypto";

let cachedUserId: string | null = null;

export async function getLocalUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  
  const existing = db.select({ id: user.id }).from(user).limit(1).all();
  if (existing.length > 0) {
    cachedUserId = existing[0].id;
    return cachedUserId;
  }
  
  const id = randomUUID();
  db.insert(user).values({ id, createdAt: new Date(), updatedAt: new Date() }).run();
  cachedUserId = id;
  return id;
}
```

### `db/schema.ts` changes
- Remove imports: `boolean`, `pgTable` → import `sqliteTable`, `integer` from `drizzle-orm/sqlite-core`
- Remove tables: `session`, `account`, `verification`
- `user` table: make `email` and `name` nullable (no auth means no required identity fields)
- All `timestamp(col)` → `integer(col, { mode: "timestamp" })`
- All `boolean(col)` → `integer(col, { mode: "boolean" })`
- All `pgTable(...)` → `sqliteTable(...)`

### Pattern replacement in all actions
```typescript
// Before
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) throw new Error("Unauthorized");
const userId = session.user.id;

// After
const userId = await getLocalUserId();
```

### `updateUserSettings.ts` — also remove `.returning()`
SQLite supports RETURNING but callers only check `success`, so simplify:
```typescript
await db.update(userSettings).set({ ollamaUrl, updatedAt: new Date() })
  .where(eq(userSettings.userId, userId));
return { success: true };
```

---

## Environment Variables

**Remove:**
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Add (optional):**
- `SQLITE_DB_PATH=./ollama-next.db` (defaults to this if not set)

---

## Migrations

```bash
rm db/migrations/meta/_journal.json
npx drizzle-kit generate   # generates SQLite schema with 4 tables (user, userSettings, conversations, messages)
npx drizzle-kit migrate    # creates the .db file
```

---

## Docker Setup
```yaml
volumes:
  - ./data:/app/data
environment:
  - SQLITE_DB_PATH=/app/data/ollama-next.db
```

---

## Verification
1. `npm run build` — no TypeScript errors
2. `npm run dev` — app loads without DATABASE_URL or auth env vars
3. Navigate to `/chat` — no redirect to `/auth`, page renders
4. Open `/settings` — Ollama URL update works (calls `updateUserSettings`)
5. Create conversation → send message → verify it persists on reload
6. Confirm `ollama-next.db` file created with tables: `user`, `user_settings`, `conversations`, `messages`
7. Confirm only one row in `user` table after multiple requests
