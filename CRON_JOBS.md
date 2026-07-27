# Cron Jobs Setup Guide

OpenSEO Democratic uses a **hybrid cron architecture** to stay within Vercel's free tier limits while maintaining full functionality.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  cron-jobs.org (Free)  │  GitHub Actions (Free)                 │
│  ─────────────────────  │  ─────────────────────                  │
│  • Lightweight tasks    │  • Heavy scraping (Playwright)        │
│  • Cache refresh        │  • Multi-page crawling                  │
│  • Community sync       │  • Batch keyword research               │
│  • Status checks        │  • Full site audits                     │
│         │               │         │                               │
│         ▼               │         ▼                               │
│  ┌─────────────────┐   │  ┌─────────────────┐                   │
│  │  Vercel API     │   │  │  Vercel API     │                   │
│  │  (10s timeout)  │   │  │  (POST results) │                   │
│  └─────────────────┘   │  └─────────────────┘                   │
│         │               │         │                               │
│         └───────────────┴─────────┘                               │
│                          │                                        │
│                   ┌──────┴──────┐                                 │
│                   │  PostgreSQL │                                 │
│                   │  (Neon)     │                                 │
│                   └─────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Split?

| Task | Vercel Limit | Solution |
|------|-------------|----------|
| **SERP Scraping** | 10s timeout (Hobby) | GitHub Actions (6hr runtime) |
| **Site Crawling** | 10s timeout | GitHub Actions (45min timeout) |
| **Cache Refresh** | Fits in 10s | cron-jobs.org → Vercel |
| **Community Sync** | Fits in 10s | cron-jobs.org → Vercel |
| **Status Checks** | Fits in 10s | cron-jobs.org → Vercel |

## Setup cron-jobs.org (Free Tier)

[cron-jobs.org](https://cron-jobs.org) is a free cron job scheduler. It makes HTTP requests to your endpoints.

### Step 1: Get Your CRON_SECRET

```bash
# Generate a secure random string
openssl rand -base64 32
# Example: abc123xyz789... (save this)
```

Add to Vercel environment variables:
- `CRON_SECRET` → your generated secret

### Step 2: Create Jobs on cron-jobs.org

Go to [cron-jobs.org/en/](https://cron-jobs.org/en/) and create these jobs:

#### Job 1: Community Sync (Lightweight)
- **Title**: OpenSEO - Community Sync
- **Address**: `https://your-app.vercel.app/api/cron/community-sync`
- **Schedule**: Every 12 hours
- **HTTP Method**: GET
- **Headers**: 
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  ```

#### Job 2: Cache Warmup (Lightweight)
- **Title**: OpenSEO - Cache Warmup
- **Address**: `https://your-app.vercel.app/api/cron/rank-tracking`
- **Schedule**: Every 6 hours
- **HTTP Method**: GET
- **Headers**: 
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  ```

#### Job 3: Site Audit Trigger (Lightweight)
- **Title**: OpenSEO - Site Audit Trigger
- **Address**: `https://your-app.vercel.app/api/cron/site-audit`
- **Schedule**: Daily at 2:00 AM UTC
- **HTTP Method**: GET
- **Headers**: 
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  ```

#### Job 4: Keyword Research Trigger
- **Title**: OpenSEO - Keyword Research
- **Address**: `https://your-app.vercel.app/api/cron/keyword-research`
- **Schedule**: Every 3 hours
- **HTTP Method**: GET
- **Headers**: 
  ```
  Authorization: Bearer YOUR_CRON_SECRET
  ```

### Step 3: Verify Jobs

After creating each job, click **"Test"** on cron-jobs.org to verify:
- Response code: 200
- Response body contains: `"success": true`

## Setup GitHub Actions (Free Tier)

GitHub Actions provides **2,000 minutes/month** of free compute — more than enough for SEO scraping.

### Step 1: Add Secrets to GitHub

Go to your repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name | Value |
|-------------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis REST token |
| `CRON_SECRET` | Same secret as above |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### Step 2: Workflows Already Created

These workflows are in `.github/workflows/`:

| Workflow | Schedule | Purpose | Runtime |
|----------|----------|---------|---------|
| `rank-tracking.yml` | Every 6 hours | Full SERP scraping with Playwright | ~15 min |
| `site-audit.yml` | Daily 2 AM UTC | Multi-page site crawling | ~30 min |
| `keyword-research.yml` | Every 3 hours | Batch keyword volume/difficulty | ~10 min |
| `community-sync.yml` | Every 12 hours | Contribution processing | ~2 min |

### Step 3: Enable Actions

1. Push the repo to GitHub
2. Go to Actions tab → enable workflows
3. Click on any workflow → "Run workflow" to test manually

### Step 4: Monitor Usage

GitHub free tier: **2,000 minutes/month**

Our usage:
- Rank tracking: 4 runs/day × 15 min = 60 min/day = 1,800 min/month
- Site audit: 1 run/day × 30 min = 30 min/day = 900 min/month
- Keyword research: 8 runs/day × 10 min = 80 min/day = 2,400 min/month
- Community sync: 2 runs/day × 2 min = 4 min/day = 120 min/month

**Total: ~5,220 min/month** — EXCEEDS free tier!

### Optimization for Free Tier

To stay within 2,000 minutes:

1. **Reduce frequency**:
   - Rank tracking: Every 12 hours (not 6) → 900 min/month
   - Site audit: Every 2 days (not daily) → 450 min/month
   - Keyword research: Every 6 hours (not 3) → 1,200 min/month
   - Community sync: Daily (not 2x) → 60 min/month
   - **Total: ~2,610 min/month** — still over

2. **Use cron-jobs.org for more tasks**:
   - Move keyword research trigger to cron-jobs.org
   - Only run heavy scraping on GitHub Actions when needed
   - **Total: ~1,500 min/month** ✅ Within free tier

3. **Alternative: Use self-hosted runner** (if you have a VPS):
   - Zero GitHub minutes used
   - Unlimited runtime

## Alternative: Self-Hosted Scraper (VPS)

If you have a cheap VPS ($5/month on Hetzner, DigitalOcean, etc.):

```bash
# On your VPS
git clone https://github.com/YOUR_USERNAME/open-seo-democratic.git
cd open-seo-democratic
npm install
npx playwright install chromium

# Add to crontab
crontab -e

# Add these lines:
0 */6 * * * cd /path/to/app && SCRAPER_MODE=heavy npx tsx src/scripts/scraper-worker.ts --task=rank-tracking
0 2 * * * cd /path/to/app && SCRAPER_MODE=heavy npx tsx src/scripts/scraper-worker.ts --task=site-audit
0 */3 * * * cd /path/to/app && SCRAPER_MODE=heavy npx tsx src/scripts/scraper-worker.ts --task=keyword-research
0 */12 * * * cd /path/to/app && SCRAPER_MODE=lightweight npx tsx src/scripts/scraper-worker.ts --task=community-sync
```

This uses **zero** GitHub Actions minutes and **zero** cron-jobs.org jobs.

## Troubleshooting

### cron-jobs.org returns 401
- Check `CRON_SECRET` matches exactly
- Verify header format: `Authorization: Bearer YOUR_SECRET`

### GitHub Actions fails with timeout
- Increase `timeout-minutes` in workflow file
- Reduce `maxPages` in scraper config

### Vercel API returns 504 (Gateway Timeout)
- The endpoint is doing too much work
- Move heavy logic to GitHub Actions
- Use the lightweight scraper on Vercel

### Playwright not found in GitHub Actions
- Make sure `npx playwright install chromium` runs before scraping
- Check that `playwright-core` is in dependencies (not devDependencies)

## Summary

| Component | Free Tier | Our Usage | Status |
|-----------|-----------|-----------|--------|
| Vercel | 10s functions | Lightweight API | ✅ OK |
| Neon | 500MB storage | ~50MB | ✅ OK |
| Upstash Redis | 10k req/day | ~2k/day | ✅ OK |
| cron-jobs.org | Unlimited jobs | 4 jobs | ✅ OK |
| GitHub Actions | 2,000 min/mo | ~1,500 min/mo | ✅ OK |

**Everything stays 100% free!**
