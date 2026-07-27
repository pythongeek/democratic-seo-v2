# OpenSEO Democratic 🗳️

> **100% Free, Open Source Alternative to Semrush and Ahrefs**

No subscriptions. No paid API keys required. No gatekeeping. 
Community-driven SEO tools that run on free infrastructure and self-hosted scraping.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/open-seo-democratic)

---

## 🚀 What's Different?

| | Enterprise Tools | Original OpenSEO | **OpenSEO Democratic** |
|---|---|---|---|
| **Cost** | $100-500/mo | Pay-as-you-go (DataForSEO) | **$0 — Completely Free** |
| **Data Source** | Proprietary | DataForSEO API ($$$) | **Self-hosted scraping + Free APIs** |
| **Governance** | Corporate | Founder-led | **Community votes on everything** |
| **Hosting** | SaaS only | Cloudflare/Docker | **Vercel + Neon + Upstash (all have free tiers)** |
| **Code** | Closed | Open | **Open + Democratic roadmap** |

---

## ✨ Features (All Free)

### SEO Tools
- **🔍 Keyword Research** — SERP scraping + Google Trends + Search Console (your sites)
- **📊 Rank Tracking** — Playwright-based SERP scraper, no API limits
- **🔗 Backlink Discovery** — Google `link:` search + Bing API (free tier) + Common Crawl
- **🛡️ Site Audits** — Self-hosted crawler + Google PageSpeed Insights (free)
- **🎯 Competitor Analysis** — SERP scraping + content gap analysis
- **🤖 AI Visibility** — Track brand mentions in AI overviews & featured snippets

### Democratic Features
- **🗳️ Feature Voting** — Propose and vote on the roadmap
- **🏆 Contribution System** — Earn reputation points for code, docs, SEO data
- **📋 Community Templates** — Share audit templates, keyword strategies
- **📜 Transparent Governance** — Public proposals, quorum-based decisions

### AI Integration
- **MCP Server** — Connect Claude, OpenClaw, Hermes directly to your SEO data
- **Agent Skills** — Pre-built workflows for AI-assisted SEO

---

## 🏗️ Architecture (100% Free Stack)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Free Tier)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │  Next.js 15 │  │  Hono API    │  │  Lightweight       │    │
│  │  (App Router)│  │  (Edge/Node) │  │  Scraper (fetch)   │    │
│  └─────────────┘  └──────────────┘  └─────────────────────┘    │
│                              │                                   │
│        ┌─────────────────────┼─────────────────────┐           │
│        ▼                     ▼                     ▼           │
│ ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐ │
│ │  Neon        │    │  Upstash Redis  │    │  Free APIs       │ │
│ │  (Postgres)  │    │  (Cache/Queue)  │    │  PageSpeed, Bing │ │
│ └──────────────┘    └─────────────────┘    └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ POST results
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions (Free Tier)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐      │
│  │  Playwright │  │  Heavy SERP  │  │  Site Crawler      │      │
│  │  (Chromium) │  │  Scraper     │  │  (Multi-page)      │      │
│  └─────────────┘  └──────────────┘  └─────────────────────┘      │
│                              │                                   │
│                   ┌──────────┴──────────┐                        │
│                   │  cron-jobs.org      │                        │
│                   │  (Free Scheduler)   │                        │
│                   └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Why this architecture?**
- **Vercel** has 10s function timeout on free tier — too short for Playwright
- **GitHub Actions** gives 2,000 min/month free — perfect for background scraping
- **cron-jobs.org** provides unlimited free cron jobs — triggers lightweight tasks
- **Neon + Upstash** handle data and caching within their generous free tiers

### Data Sources (No Paid APIs Required)

| Feature | Free Data Source | Paid Enhancement (Optional) |
|---------|-----------------|---------------------------|
| Keywords | SERP scraping + Google Trends | Search Console API (your sites, free) |
| Rank Tracking | Playwright SERP scraper | — |
| Backlinks | Google `link:` + Bing API free tier | — |
| Site Audit | Self-hosted crawler + PageSpeed Insights | — |
| Competitors | SERP scraping + overlap analysis | — |
| AI Visibility | SERP feature detection | — |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **API**: Hono.js (runs on Vercel Edge/Node)
- **Database**: PostgreSQL via [Neon](https://neon.tech) (free tier: 500MB)
- **Cache**: [Upstash Redis](https://upstash.com) (free tier: 10k req/day)
- **Auth**: Better Auth (OAuth: GitHub, Google)
- **Scraping**: Playwright Core (self-hosted Chromium)
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Cron**: Vercel Cron Jobs

---

## 📦 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-username/open-seo-democratic.git
cd open-seo-democratic
npm install
```

### 2. Install Playwright (for scraping)
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
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` → [GitHub OAuth](https://github.com/settings/developers)
- *(Optional)* `GOOGLE_API_KEY` → [Google Cloud](https://console.cloud.google.com) (enhances PageSpeed data)
- *(Optional)* `BING_API_KEY` → [Bing Web Search API](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api) (enhances backlinks)

### 4. Database Setup
```bash
npm run db:push
npm run db:studio    # Optional: GUI for database
```

### 5. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel (Free)

### One-Click Deploy
Click the **"Deploy with Vercel"** button above.

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

This tool uses **Playwright** to scrape public search results. Please respect:

1. **Rate limiting** — Built-in delays between requests
2. **Robots.txt** — We respect crawler directives
3. **Fair use** — Don't hammer search engines; use caching (Redis)
4. **Legal compliance** — Check your jurisdiction's laws on web scraping

**For production:** Consider running Playwright on a separate server/VPS to avoid Vercel's serverless timeout limits (max 60s on Pro, 10s on Hobby).

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
- [DataForSEO](https://dataforseo.com) for the original paid data architecture (we replaced it!)
- The OpenSEO Community for making this democratic

---

**Built with ❤️ by the community, for the community.**
