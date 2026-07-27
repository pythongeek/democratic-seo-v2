// Scraper configuration — Vercel-compatible architecture
// All values have sensible defaults for free usage

export const SCRAPER_CONFIG = {
  // Mode: 'lightweight' (Vercel) or 'heavy' (GitHub Actions / local)
  mode: process.env.SCRAPER_MODE || "lightweight",

  // Rate limiting (be nice to search engines)
  delayBetweenRequests: 2000, // ms
  maxConcurrentRequests: 2,

  // SERP scraping
  serp: {
    maxPages: 2, // Pages per keyword (20 results)
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    timeout: 8000, // Reduced for Vercel compatibility
  },

  // Site crawling
  crawler: {
    maxPages: 50, // Max pages per audit (heavy mode only)
    maxDepth: 3,
    timeout: 30000,
    respectRobotsTxt: true,
  },

  // Backlink discovery
  backlinks: {
    maxResults: 100,
    useBingApi: true, // Requires BING_API_KEY env var
    useGoogleLinkSearch: true,
    useCommonCrawl: false, // Future enhancement
  },

  // Cache settings
  cache: {
    serpTtl: 1800, // 30 minutes
    keywordTtl: 3600, // 1 hour
    backlinkTtl: 3600 * 6, // 6 hours
    auditTtl: 3600 * 24, // 24 hours
  },
} as const;

// Free tier limits (for display in UI)
export const FREE_TIER_LIMITS = {
  keywordsPerDay: 100,
  rankChecksPerDay: 200,
  siteAuditsPerDay: 10,
  backlinkChecksPerDay: 50,
  competitorAnalysesPerDay: 20,
};

// Environment detection
export function isVercelEnvironment(): boolean {
  return !!process.env.VERCEL || process.env.SCRAPER_MODE === "lightweight";
}

export function isGitHubActions(): boolean {
  return !!process.env.GITHUB_ACTIONS;
}
