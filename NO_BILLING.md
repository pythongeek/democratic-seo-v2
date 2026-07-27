# NO BILLING POLICY

**This app is permanently 100% free.** There is no billing layer, no paid plans, no credit metering, and no auth mode switch.

## What is FORBIDDEN in this codebase

| Pattern | Why |
|---|---|
| `@/lib/billing/*` or any `billing.ts` | We don't bill. |
| `useAutumn`, `autumn-js`, `autumn` packages | We don't use Autumn. |
| `use autumn` anywhere in code, comments, or imports | Dead reference. |
| `AUTH_MODE` env var (any value: `hosted`, `local_noauth`, `cloudflare_access`, etc.) | There is one mode: open. |
| `AUTUMN_SECRET_KEY`, `AUTUMN_API_KEY`, `BILLING_*` env vars | No billing provider to authenticate to. |
| `isHostedServerAuthMode()`, `isHostedClientAuthMode()` helpers | There is no hosted mode. |
| `checkUsageCreditsDepleted`, `assertPaidPlan`, `customerHasPaidPlan`, `meterDataforseoCall` | No credits to check. |
| `FreePlanBanner`, `HostedPlanGate` components | There is no paid plan to gate. |
| `posthog` (hosted-only analytics) | PostHog is for the hosted product; we use Vercel Analytics or nothing. |
| `DataForSEO` *calls* (not just mentions) | The app uses free self-hosted scraping. DataForSEO is mentioned in the UI as a future paid enhancement, but the app does **not** call it. |
| `assertUsageCreditsAvailable`, `resolveAuditLimitTier` | We don't gate features on tier. |

## What IS allowed

- ✅ Mentioning `DataForSEO` in the settings page as a future "Coming Soon" enhancement (current behavior).
- ✅ The health endpoint returning `"pricing": "100% free — no DataForSEO"` (current behavior).
- ✅ `SCRAPER_MODE=lightweight` env var — this is about the *scraper implementation* (Vercel-friendly vs Playwright), not billing.
- ✅ `FREE_TIER_LIMITS` in `src/lib/scraper-config.ts` — these are per-user rate limits for the free self-hosted scraper, not billing plans.
- ✅ User authentication via `better-auth` (no auth = no project ownership).

## Why this exists

The companion Cloudflare Workers version of this app (`open-seo.tsnion.workers.dev`) has an `AUTH_MODE=hosted` switch that activates an Autumn billing pipeline. When deployed as a single-tenant free app, leaving that switch on causes:

- "You've used all your credits" banners on every page
- "An unexpected error occurred" on every SEO feature
- SAM chat refusing to respond

This Vercel version has **never** had that code, and the policy here is to **keep it that way**. Adding it would re-create those bugs.

## How to enforce

```bash
node scripts/check-no-billing.mjs
```

This is wired into the CI workflow (`.github/workflows/ci.yml`) and runs on every push. It greps the source tree for any of the forbidden patterns and exits non-zero on a hit.

If you genuinely need a feature that requires billing, fork the Cloudflare version — do not add it here.
