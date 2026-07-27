#!/usr/bin/env node
// scripts/check-no-billing.mjs
// CI guard: fails the build if any forbidden billing pattern is reintroduced.
// See NO_BILLING.md for the full policy.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/(?=[a-z]:\/)/, "");
const SCAN_DIRS = ["src", "scripts", ".github", "next.config.ts", "vercel.json", "package.json", ".env.example"];
const SCAN_EXTS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".jsonc", ".yml", ".yaml", ".md"]);

const FORBIDDEN = [
  // Code patterns
  { pattern: /useAutumn|from\s+["']autumn/i, label: "Autumn SDK import" },
  { pattern: /AUTUMN_SECRET_KEY|AUTUMN_API_KEY|BILLING_/i, label: "Billing env var" },
  { pattern: /AUTH_MODE\s*[:=]/i, label: "AUTH_MODE switch (use single open mode)" },
  { pattern: /isHostedServerAuthMode|isHostedClientAuthMode/i, label: "Hosted auth mode helper" },
  { pattern: /checkUsageCreditsDepleted|assertUsageCreditsAvailable|assertPaidPlan|customerHasPaidPlan|resolveAuditLimitTier|meterDataforseoCall/i, label: "Billing credit gate" },
  { pattern: /from\s+["']posthog/i, label: "PostHog SDK import (hosted-only analytics)" },
  { pattern: /FreePlanBanner|HostedPlanGate/i, label: "Billing UI component" },
  // Dependency patterns (package.json)
  { pattern: /"autumn(-js)?"\s*:\s*"/i, label: "autumn / autumn-js dependency" },
  { pattern: /"posthog-js?"\s*:\s*"/i, label: "posthog-js / posthog-node dependency" },
];

// Allowlist: files where these patterns are documentation, not code.
// (The settings page mentions DataForSEO as "Coming Soon" — that mention is allowed,
//  but a `import` or `call` of DataForSEO is not. The script below only flags the
//  patterns above, not the word "DataForSEO" itself.)
const ALLOWLIST = new Set([
  "src/app/(dashboard)/settings/page.tsx", // mentions DataForSEO as a future paid enhancement
  "src/app/api/[[...route]]/route.ts",     // health endpoint mentions "no DataForSEO"
  "NO_BILLING.md",                          // this policy file
  "scripts/check-no-billing.mjs",           // the guard itself
]);

let violations = [];

async function walk(p) {
  let st;
  try { st = await stat(p); } catch { return; }
  if (st.isDirectory()) {
    const entries = await readdir(p, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === ".git" || e.name === "dist") continue;
      await walk(join(p, e.name));
    }
  } else if (st.isFile()) {
    const ext = p.slice(p.lastIndexOf("."));
    if (!SCAN_EXTS.has(ext)) return;
    const rel = relative(ROOT, p).replace(/\\/g, "/");
    if (ALLOWLIST.has(rel)) return;
    const content = await readFile(p, "utf8");
    for (const { pattern, label } of FORBIDDEN) {
      if (pattern.test(content)) {
        violations.push({ file: rel, label });
      }
    }
  }
}

for (const target of SCAN_DIRS) await walk(join(ROOT, target));

if (violations.length) {
  console.error("\n❌ NO_BILLING policy violation(s) found:\n");
  for (const v of violations) {
    console.error(`  ${v.file}  →  ${v.label}`);
  }
  console.error("\nSee NO_BILLING.md for the full policy. This guard exists to keep");
  console.error("Democratic SEO permanently free of billing dependencies.\n");
  process.exit(1);
}

console.log("✅ NO_BILLING guard passed — no billing patterns found.");
