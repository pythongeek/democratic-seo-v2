import { drizzle } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import * as schema from "./schema";

// IMPORTANT: lazy-initialize the Neon client so importing this module at
// build time (e.g. by next build when collecting page data for API routes)
// does NOT throw when DATABASE_URL is unset. Vercel only injects runtime
// env vars at request time — they are NOT present during `next build`.
//
// Any code path that needs the DB should call getDb() at request time,
// not at module load time. The exported `db` proxy below forwards every
// property access to a freshly-built drizzle instance, so existing call
// sites (`db.select(...)`, `db.query.x.findMany(...)`) continue to work.

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it in Vercel Project → Settings → Environment Variables."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    _db = drizzle(getSql(), { schema });
  }
  return _db;
}

// Proxy so `db.select(...)`, `db.query.x.findMany(...)` etc. all keep
// working unchanged — they just trigger lazy init on first access.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const target = getDb() as unknown as Record<string | symbol, unknown>;
    const value = target[prop];
    return typeof value === "function" ? (value as Function).bind(target) : value;
  },
});

export type DB = typeof db;
