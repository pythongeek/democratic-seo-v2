# OpenSEO Democratic — Setup Guide

## ✅ What Was Built

A **100% free**, Vercel-compatible, community-governed SEO platform with **zero paid API dependencies**.

### Removed Dependencies
- ❌ `dataforseo-client` — Removed entirely
- ❌ DataForSEO API key requirement — Gone
- ❌ Pay-as-you-go costs — Eliminated

### Replaced With Free Stack
| Original (Paid) | Replacement (Free) |
|-----------------|-------------------|
| DataForSEO Keyword API | Self-hosted Playwright SERP scraper + Google Trends |
| DataForSEO Rank API | Playwright Google SERP scraping |
| DataForSEO Backlinks API | Google `link:` search + Bing API free tier |
| DataForSEO Site Audit | Self-hosted crawler + PageSpeed Insights API |
| DataForSEO Competitor API | SERP overlap scraping |

---

## 🏗️ Architecture & Free Tier Limits

### The Problem: Vercel Free Tier Timeout
Vercel Hobby tier has a **10-second function timeout**. Playwright scraping needs 30-60 seconds.

### The Solution: Hybrid Architecture

```
User Request → Vercel API (10s max)
                    │
         ┌─────────┴──────────┐
         ▼                    ▼
   Cache Hit (instant)   Cache Miss
         │                    │
         ▼                    ▼
   Return data        Lightweight scraper
   (0-50ms)           (fetch + cheerio, <8s)
                             │
                             ▼
                        Return fresh data
                             │
                             ▼
              GitHub Actions (background refresh)
              • Full Playwright scraping
              • Multi-page crawling
              • Batch processing
```

### Component Breakdown

| Component | Free Tier | Our Usage | Notes |
|-----------|-----------|-----------|-------|
| **Vercel** | 10s/func, 100GB bandwidth | API + UI only | No heavy scraping |
| **Neon** | 500MB storage, 190 compute hrs | ~50MB, ~10 hrs | Plenty of headroom |
| **Upstash Redis** | 10k req/day | ~2k req/day | Caching reduces DB load |
| **cron-jobs.org** | Unlimited jobs | 4 jobs | Triggers lightweight tasks |
| **GitHub Actions** | 2,000 min/month | ~1,500 min | Heavy scraping workers |

### Scraper Modes

| Mode | Environment | Method | Use Case |
|------|-------------|--------|----------|
| `lightweight` | Vercel (default) | fetch + cheerio | Real-time API requests |
| `heavy` | GitHub Actions | Playwright + Chromium | Background batch jobs |
| `auto` | Any | Detects environment | Switches automatically |

Set mode via environment variable:
```bash
SCRAPER_MODE=lightweight  # Vercel
SCRAPER_MODE=heavy        # GitHub Actions / VPS
```

---

## 📁 File Structure

```
open-seo-democratic/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing, Features, Docs pages
│   │   ├── (dashboard)/           # All SEO tool dashboards
│   │   │   ├── dashboard/
│   │   │   ├── keywords/
│   │   │   ├── rank-tracking/
│   │   │   ├── backlinks/
│   │   │   ├── site-audit/
│   │   │   ├── competitors/
│   │   │   ├── ai-visibility/
│   │   │   ├── community/
│   │   │   ├── governance/
│   │   │   └── settings/
│   │   └── api/
│   │       ├── [[...route]]/route.ts    # Hono API (all routes)
│   │       └── auth/[...all]/route.ts   # Better Auth
│   ├── components/
│   │   ├── marketing/             # Hero, Features, CTA, Stats
│   │   ├── layout/                # Navbar, Footer, Sidebar, Header
│   │   ├── seo/                   # StatsCards, QuickActions, etc.
│   │   └── ui/                    # Button, Input, Card, Badge, etc.
│   ├── db/
│   │   ├── schema.ts              # Full PostgreSQL schema
│   │   ├── index.ts               # Drizzle client
│   │   └── seed.ts                # Demo data
│   ├── lib/
│   │   ├── auth.ts                # Better Auth config
│   │   ├── seo-engine.ts          # Adaptive scraper (lightweight/heavy)
│   │   ├── scraper-lightweight.ts # fetch + cheerio for Vercel
│   │   ├── scraper-config.ts      # Scraper settings & limits
│   │   ├── redis.ts               # Upstash Redis cache
│   │   └── utils.ts               # cn(), formatters
│   ├── scripts/
│   │   └── scraper-worker.ts      # GitHub Actions worker script
│   └── types/
│       └── index.ts               # TypeScript types
├── .github/workflows/             # GitHub Actions cron workers
│   ├── rank-tracking.yml
│   ├── site-audit.yml
│   ├── keyword-research.yml
│   └── community-sync.yml
├── drizzle.config.ts              # Drizzle ORM config
├── next.config.ts                 # Next.js config
├── tailwind.config.ts             # Tailwind CSS
├── postcss.config.js              # PostCSS
├── vercel.json                    # Vercel deploy config (NO cron jobs)
├── package.json                   # Dependencies (NO dataforseo-client)
├── .env.example                   # Environment variables
├── README.md                      # Full documentation
├── CONTRIBUTING.md                # Contribution guidelines
├── CRON_JOBS.md                   # Cron setup guide
└── LICENSE                        # MIT License
```

---

## 🚀 Quick Deploy Checklist

### 1. Clone & Install
```bash
git clone https://github.com/your-username/open-seo-democratic.git
cd open-seo-democratic
npm install
```

### 2. Install Playwright (for GitHub Actions / local heavy mode)
```bash
npx playwright install chromium
```

### 3. Environment Variables
```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` → [Neon](https://neon.tech) (free, no credit card)
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` → [Upstash](https://upstash.com) (free)
- `BETTER_AUTH_SECRET` → `openssl rand -base64 32`
- `BETTER_AUTH_URL` → `http://localhost:3000`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` → [GitHub OAuth](https://github.com/settings/developers)
- `CRON_SECRET` → `openssl rand -base64 32` (for securing cron endpoints)
- `SCRAPER_MODE` → `lightweight` (for Vercel) or `heavy` (for local/GH Actions)

Optional (enhances data but NOT required):
- `GOOGLE_API_KEY` → [Google Cloud](https://console.cloud.google.com) (PageSpeed Insights)
- `BING_API_KEY` → [Bing Web Search API](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api) (backlinks)

### 4. Database
```bash
npm run db:push      # Push schema to PostgreSQL
npm run db:seed      # Add demo data
npm run db:studio    # Optional: GUI browser
```

### 5. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel (Free)

### One-Click Deploy
Click the **"Deploy with Vercel"** button in README.

### Manual Deploy
1. Push to GitHub
2. Import repo in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add environment variables from `.env.example`
4. Add integrations:
   - **Storage** → [Neon](https://vercel.com/integrations/neon) or [Vercel Postgres](https://vercel.com/storage/postgres)
   - **Redis** → [Upstash](https://vercel.com/integrations/upstash)
5. Deploy!

### Post-Deploy
```bash
# Run database migrations on production
vercel env pull
npm run db:push
```

### 6. Setup Cron Jobs

**Option A: cron-jobs.org (Recommended, Free)**
1. Go to [cron-jobs.org](https://cron-jobs.org)
2. Create jobs pointing to your Vercel API endpoints
3. See [CRON_JOBS.md](./CRON_JOBS.md) for detailed setup

**Option B: GitHub Actions (For heavy scraping)**
1. Add repository secrets (DATABASE_URL, UPSTASH_REDIS, CRON_SECRET)
2. Workflows in `.github/workflows/` run automatically
3. See [CRON_JOBS.md](./CRON_JOBS.md) for optimization tips

**Option C: Self-hosted VPS**
- Run `crontab` on any $5/month VPS
- Zero dependency on external schedulers
- See [CRON_JOBS.md](./CRON_JOBS.md) for crontab examples

---

## 🔌 Rankiir Integration

Rankiir is a **free desktop app** for AI visibility tracking. Since it's a desktop app (not a web API), integration works via data import:

### Setup
1. Download Rankiir from [rankiir.com](https://rankiir.com) (free)
2. Add keywords and track in the desktop app
3. Export data as JSON
4. Go to OpenSEO → Settings → Import Data → Paste JSON
5. Go to AI Visibility → switch source to "Rankiir" or "Both"

### Data Flow
```
Rankiir Desktop App → Export JSON 
                              │
                              ▼
              OpenSEO Settings → Import Data
                              │
                              ▼
                        POST /api/integrations/rankiir/import
                              │
                              ▼
                        PostgreSQL (rankiir_imports table)
                              │
                              ▼
                        AI Visibility Dashboard
```

### API Endpoints
- `POST /api/integrations/rankiir/import` — Import Rankiir JSON data
- `GET /api/integrations/rankiir/imports/:projectId` — View imported data
- `GET /api/integrations/rankiir/stats/:projectId` — Aggregated stats by engine

---

## 🗳️ How Democracy Works

### 1. Propose
Anyone can submit a proposal:
- **Feature Request** — "Add bulk keyword import"
- **Bug Report** — "Fix mobile navigation"
- **Governance** — "Change voting threshold to 15"
- **Integration** — "Add Ahrefs API support (optional paid)"

### 2. Vote
- Each user gets 1 vote per proposal
- Proposals need `quorum` votes to be considered
- `votesFor` must exceed `votesAgainst` by threshold

### 3. Contribute & Earn Points
| Contribution | Points |
|-------------|--------|
| 🐛 Bug report | 5 |
| 📖 Documentation | 10 |
| 🎨 Design/UI | 15 |
| 💻 Code PR | 20-50 |
| 📊 SEO data sharing | 10 |

### 4. Governance Levels
- **Member** (0 pts) — Use tools, vote on proposals
- **Contributor** (100 pts) — Submit proposals, review contributions
- **Moderator** (500 pts) — Approve contributions, manage community
- **Core Team** (1000 pts) — Merge PRs, set roadmap priorities

---

## 🔌 MCP & AI Agents

OpenSEO Democratic exposes an MCP server so AI agents can use your SEO data:

```bash
# Claude Code
claude mcp add openseo https://your-app.vercel.app/api/mcp/manifest

# OpenClaw
openclaw connect https://your-app.vercel.app/api/mcp/manifest
```

**Available Tools:**
- `keyword_research` — Free keyword data
- `rank_check` — SERP position tracking
- `backlink_analysis` — Link discovery
- `site_audit` — Technical SEO crawl
- `competitor_analysis` — Gap analysis

---

## ⚠️ Scraping Ethics & Limits

This tool uses **fetch + cheerio** (lightweight) and **Playwright** (heavy) to scrape public search results. Please respect:

1. **Rate limiting** — Built-in delays between requests
2. **Robots.txt** — We respect crawler directives
3. **Fair use** — Don't hammer search engines; use caching (Redis)
4. **Legal compliance** — Check your jurisdiction's laws on web scraping

**For production:** GitHub Actions workers handle heavy scraping. Vercel API only serves cached data and runs lightweight scraper.

---

## 🧪 Optional Paid Enhancements

While the core is 100% free, you can optionally add:

| Enhancement | Cost | Benefit |
|------------|------|---------|
| **DataForSEO** | Pay-as-you-go | More accurate search volume, CPC, backlink counts |
| **SerpAPI** | Free tier + paid | Faster SERP results, no scraping needed |
| **Ahrefs API** | Paid | Accurate backlink data, DR/UR scores |
| **Google Search Console** | Free | Real query data for YOUR sites only |

> **The free version works perfectly without any of these.**

---

## 🤝 Contributing

We welcome all contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

All contributors earn reputation points and appear on the community leaderboard.

---

## 📜 License

MIT License — Free for personal and commercial use.

---

## 🙏 Acknowledgments

- Original [OpenSEO](https://github.com/every-app/open-seo) by Ben Senescu for the inspiration
- [Rankiir](https://rankiir.com) for the free AI visibility desktop app
- The OpenSEO Community for making this democratic

---

**Built with ❤️ by the community, for the community.**
