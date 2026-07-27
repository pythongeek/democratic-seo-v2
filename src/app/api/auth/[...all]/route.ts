import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

// Better Auth handler is created lazily so that `next build` doesn't try
// to evaluate it at module-load time (when BETTER_AUTH_SECRET is unset on
// Vercel). Each request calls getAuth() which builds the instance once
// and caches it for subsequent calls.
async function handler(req: NextRequest) {
  const auth = getAuth();
  return auth.handler(req);
}

export const GET = handler;
export const POST = handler;
