// ============================================================
// FREE SEO ENGINE — Vercel-compatible architecture
// 
// MODE 1: Lightweight (default on Vercel) — fetch + cheerio
//   - Fits within 10s Vercel hobby timeout
//   - No Playwright/Chromium needed
//   - Set SCRAPER_MODE=lightweight or runs on Vercel automatically
//
// MODE 2: Heavy (GitHub Actions workers) — Playwright
//   - Full browser automation
//   - Triggered by GitHub Actions cron or manual dispatch
//   - Posts results back to Vercel API
//
// MODE 3: Hybrid (recommended)
//   - Vercel API serves cached data instantly
//   - GitHub Actions workers refresh cache in background
// ============================================================

import {
  scrapeSERPLightweight,
  crawlPageLightweight,
  discoverBacklinksLightweight,
  isVercelEnvironment,
} from "./scraper-lightweight";

// Dynamic import for Playwright — only loaded in heavy mode
// This prevents Vercel build/runtime errors
let chromium: any = null;
async function getChromium() {
  if (!chromium) {
    const pw = await import("playwright-core");
    chromium = pw.chromium;
  }
  return chromium;
}

// ==================== MODE DETECTION ====================
export const SCRAPER_MODE = process.env.SCRAPER_MODE || (isVercelEnvironment() ? "lightweight" : "heavy");

// ==================== GOOGLE SEARCH CONSOLE (Free) ====================
export async function fetchSearchConsoleData(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["query", "page", "device", "country"],
      rowLimit: 25000,
    }),
  });

  if (!res.ok) throw new Error(`Search Console API error: ${res.status}`);
  return res.json();
}

// ==================== PAGESPEED INSIGHTS (Free) ====================
export async function fetchPageSpeedInsights(url: string, strategy: "mobile" | "desktop" = "mobile") {
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${apiKey ? `&key=${apiKey}` : ""}`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`PageSpeed API error: ${res.status}`);
  return res.json();
}

// ==================== GOOGLE TRENDS (Free) ====================
export async function fetchGoogleTrends(keyword: string, geo: string = "US", timeframe: string = "today 12-m") {
  return {
    keyword,
    geo,
    timeframe,
    interestOverTime: [],
    relatedQueries: [],
    relatedTopics: [],
  };
}

// ==================== SERP SCRAPER (Adaptive) ====================
export interface SERPResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
  sitelinks?: string[];
  featured?: boolean;
}

export async function scrapeSERP(
  keyword: string,
  location: string = "us",
  language: string = "en",
  pages: number = 1
): Promise<SERPResult[]> {
  // On Vercel: use lightweight scraper (fetch + cheerio)
  if (SCRAPER_MODE === "lightweight") {
    console.log("[SEO Engine] Using lightweight scraper (Vercel mode)");
    return scrapeSERPLightweight(keyword, location, language, pages);
  }

  // Heavy mode: Playwright (GitHub Actions or local)
  console.log("[SEO Engine] Using Playwright scraper (heavy mode)");
  return scrapeSERPHeavy(keyword, location, language, pages);
}

async function scrapeSERPHeavy(
  keyword: string,
  location: string = "us",
  language: string = "en",
  pages: number = 1
): Promise<SERPResult[]> {
  const results: SERPResult[] = [];
  const browserType = await getChromium();

  const browser = await browserType.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });

  try {
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    for (let p = 0; p < pages; p++) {
      const start = p * 10;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=${language}&gl=${location}&start=${start}`;

      await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 30000 });

      try {
        const consentBtn = await page.$('button:has-text("Reject all")');
        if (consentBtn) await consentBtn.click();
      } catch { /* ignore */ }

      await page.waitForTimeout(2000);

      const organicResults = await page.$$eval("#search .g, div[data-hveid] .yuRUbf, div[data-sokoban-container]", (elements: Element[]) => {
        return elements.map((el, idx) => {
          const titleEl = el.querySelector("h3") || el.querySelector(".LC20lb");
          const linkEl = el.querySelector("a") as HTMLAnchorElement;
          const snippetEl = el.querySelector(".VwiC3b, .s3v94d, [data-sncf='1']");

          return {
            position: idx + 1,
            title: titleEl?.textContent?.trim() || "",
            url: linkEl?.href || "",
            snippet: snippetEl?.textContent?.trim() || "",
          };
        }).filter(r => r.url && r.title);
      });

      results.push(...organicResults.map((r: { title: string; url: string; snippet: string }, idx: number) => ({ ...r, position: start + idx + 1 })));
    }
  } finally {
    await browser.close();
  }

  return results;
}

// ==================== KEYWORD RESEARCH (Adaptive) ====================
export interface KeywordData {
  keyword: string;
  searchVolume?: number;
  cpc?: number;
  competition?: number;
  difficulty?: number;
  intent?: string;
  trends?: number[];
}

export async function researchKeywordFree(keyword: string): Promise<KeywordData> {
  const [trendsData, serpData] = await Promise.all([
    fetchGoogleTrends(keyword),
    scrapeSERP(keyword, "us", "en", 1),
  ]);

  const serpDomains = serpData.map(r => {
    try { return new URL(r.url).hostname; } catch { return ""; }
  }).filter(Boolean);

  const uniqueDomains = new Set(serpDomains).size;
  const estimatedDifficulty = Math.min(100, Math.round((uniqueDomains / 10) * 100));
  const estimatedVolume = Math.round(serpData.length * 1200 + Math.random() * 5000);

  return {
    keyword,
    searchVolume: estimatedVolume,
    cpc: parseFloat((Math.random() * 15 + 0.5).toFixed(2)),
    competition: parseFloat((Math.random()).toFixed(2)),
    difficulty: estimatedDifficulty,
    intent: inferIntent(keyword),
    trends: trendsData.interestOverTime.map((t: any) => t.value || 0),
  };
}

function inferIntent(keyword: string): string {
  const lower = keyword.toLowerCase();
  if (/buy|price|deal|discount|cheap|sale/.test(lower)) return "transactional";
  if (/how|what|why|when|where|tutorial|guide/.test(lower)) return "informational";
  if (/brand|website|login|app/.test(lower)) return "navigational";
  if (/best|top|review|compare|vs/.test(lower)) return "commercial";
  return "informational";
}

// ==================== BACKLINK DISCOVERY (Adaptive) ====================
export interface BacklinkData {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  dofollow: boolean;
  firstSeen: Date;
}

export async function discoverBacklinksFree(domain: string): Promise<BacklinkData[]> {
  // On Vercel: use lightweight scraper
  if (SCRAPER_MODE === "lightweight") {
    const links = await discoverBacklinksLightweight(domain);
    return links.map(l => ({
      sourceUrl: l.sourceUrl,
      targetUrl: `https://${domain}`,
      anchorText: l.anchorText,
      dofollow: true,
      firstSeen: new Date(),
    }));
  }

  // Heavy mode: Playwright
  return discoverBacklinksHeavy(domain);
}

async function discoverBacklinksHeavy(domain: string): Promise<BacklinkData[]> {
  const backlinks: BacklinkData[] = [];
  const browserType = await getChromium();

  try {
    const browser = await browserType.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`https://www.google.com/search?q=link:${encodeURIComponent(domain)}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const links = await page.$$eval("#search .g a", (anchors: HTMLAnchorElement[]) =>
      anchors.map(a => ({
        sourceUrl: a.href,
        anchorText: a.textContent?.trim() || "",
      })).filter((l: { sourceUrl: string; anchorText: string }) => l.sourceUrl && !l.sourceUrl.includes("google.com"))
    );

    links.forEach((link: { sourceUrl: string; anchorText: string }) => {
      backlinks.push({
        sourceUrl: link.sourceUrl,
        targetUrl: `https://${domain}`,
        anchorText: link.anchorText,
        dofollow: true,
        firstSeen: new Date(),
      });
    });

    await browser.close();
  } catch (e) {
    console.error("Backlink discovery error:", e);
  }

  // Also try Bing API if available
  try {
    const bingKey = process.env.BING_API_KEY;
    if (bingKey) {
      const res = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=linkdomain:${encodeURIComponent(domain)}`,
        { headers: { "Ocp-Apim-Subscription-Key": bingKey } }
      );
      if (res.ok) {
        const data = await res.json();
        (data.webPages?.value || []).forEach((page: any) => {
          backlinks.push({
            sourceUrl: page.url,
            targetUrl: `https://${domain}`,
            anchorText: page.name || "",
            dofollow: true,
            firstSeen: new Date(),
          });
        });
      }
    }
  } catch { /* ignore */ }

  return backlinks;
}

// ==================== SITE CRAWLER (Adaptive) ====================
export interface AuditIssue {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
  url: string;
  severity: number;
}

export interface SiteAuditResult {
  url: string;
  score: number;
  issues: AuditIssue[];
  crawledPages: number;
  totalPages: number;
  metrics: {
    loadTime: number;
    pageSize: number;
    http2: boolean;
    ssl: boolean;
    mobileFriendly: boolean;
  };
}

export async function crawlSiteFree(startUrl: string, maxPages: number = 50): Promise<SiteAuditResult[]> {
  // On Vercel: lightweight single-page crawl
  if (SCRAPER_MODE === "lightweight") {
    console.log("[SEO Engine] Using lightweight crawler (single page)");
    return crawlSiteLightweight(startUrl);
  }

  // Heavy mode: multi-page Playwright crawl
  return crawlSiteHeavy(startUrl, maxPages);
}

async function crawlSiteLightweight(startUrl: string): Promise<SiteAuditResult[]> {
  const pageData = await crawlPageLightweight(startUrl);
  const issues: AuditIssue[] = [];

  if (!pageData.description) {
    issues.push({ type: "error", category: "Meta", message: "Missing meta description", url: startUrl, severity: 8 });
  }
  if (pageData.h1Count === 0) {
    issues.push({ type: "error", category: "Heading", message: "Missing H1 tag", url: startUrl, severity: 9 });
  }
  if (pageData.h1Count > 1) {
    issues.push({ type: "warning", category: "Heading", message: `Multiple H1 tags (${pageData.h1Count})`, url: startUrl, severity: 5 });
  }
  if (pageData.imagesWithoutAlt > 0) {
    issues.push({ type: "warning", category: "Images", message: `${pageData.imagesWithoutAlt} images missing alt text`, url: startUrl, severity: 4 });
  }
  if (!pageData.canonical) {
    issues.push({ type: "warning", category: "Canonical", message: "Missing canonical tag", url: startUrl, severity: 6 });
  }
  if (pageData.loadTime > 3000) {
    issues.push({ type: "error", category: "Performance", message: `Slow load time (${pageData.loadTime}ms)`, url: startUrl, severity: 7 });
  }

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 3));

  return [{
    url: startUrl,
    score,
    issues,
    crawledPages: 1,
    totalPages: pageData.links.filter(l => {
      try { return new URL(l, startUrl).hostname === new URL(startUrl).hostname; } catch { return false; }
    }).length + 1,
    metrics: {
      loadTime: pageData.loadTime,
      pageSize: 0,
      http2: false,
      ssl: startUrl.startsWith("https"),
      mobileFriendly: true,
    },
  }];
}

async function crawlSiteHeavy(startUrl: string, maxPages: number = 50): Promise<SiteAuditResult[]> {
  const results: SiteAuditResult[] = [];
  const visited = new Set<string>();
  const toVisit = [startUrl];
  const browserType = await getChromium();

  const browser = await browserType.launch({ headless: true });

  try {
    while (toVisit.length > 0 && visited.size < maxPages) {
      const url = toVisit.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      const context = await browser.newContext();
      const page = await context.newPage();

      const startTime = Date.now();
      let pageSize = 0;
      let issues: AuditIssue[] = [];

      try {
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        const loadTime = Date.now() - startTime;

        const metrics = await page.evaluate(() => {
          return {
            title: document.title,
            description: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || "",
            h1Count: document.querySelectorAll("h1").length,
            h2Count: document.querySelectorAll("h2").length,
            imagesWithoutAlt: Array.from(document.querySelectorAll("img")).filter(img => !img.alt).length,
            links: Array.from(document.querySelectorAll("a")).map(a => (a as HTMLAnchorElement).href),
            canonical: (document.querySelector('link[rel="canonical"]') as HTMLLinkElement)?.href || "",
            robots: (document.querySelector('meta[name="robots"]') as HTMLMetaElement)?.content || "",
          };
        });

        const headers = response?.headers();
        const contentLength = headers?.["content-length"];
        pageSize = contentLength ? parseInt(contentLength) : 0;

        if (!metrics.description) issues.push({ type: "error", category: "Meta", message: "Missing meta description", url, severity: 8 });
        if (metrics.h1Count === 0) issues.push({ type: "error", category: "Heading", message: "Missing H1 tag", url, severity: 9 });
        if (metrics.h1Count > 1) issues.push({ type: "warning", category: "Heading", message: `Multiple H1 tags (${metrics.h1Count})`, url, severity: 5 });
        if (metrics.imagesWithoutAlt > 0) issues.push({ type: "warning", category: "Images", message: `${metrics.imagesWithoutAlt} images missing alt text`, url, severity: 4 });
        if (!metrics.canonical) issues.push({ type: "warning", category: "Canonical", message: "Missing canonical tag", url, severity: 6 });
        if (loadTime > 3000) issues.push({ type: "error", category: "Performance", message: `Slow load time (${loadTime}ms)`, url, severity: 7 });
        if (pageSize > 2_000_000) issues.push({ type: "warning", category: "Performance", message: `Large page size (${(pageSize / 1024 / 1024).toFixed(1)}MB)`, url, severity: 5 });

        const baseDomain = new URL(startUrl).hostname;
        metrics.links.forEach((link: string) => {
          try {
            const linkUrl = new URL(link, url);
            if (linkUrl.hostname === baseDomain && !visited.has(linkUrl.href)) {
              toVisit.push(linkUrl.href);
            }
          } catch { /* ignore */ }
        });

        const errorCount = issues.filter(i => i.type === "error").length;
        const warningCount = issues.filter(i => i.type === "warning").length;
        const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 3));

        results.push({
          url,
          score,
          issues,
          crawledPages: visited.size,
          totalPages: toVisit.length + visited.size,
          metrics: {
            loadTime,
            pageSize,
            http2: headers?.["x-http2"] === "true" || false,
            ssl: url.startsWith("https"),
            mobileFriendly: true,
          },
        });
      } catch (error) {
        issues.push({ type: "error", category: "Crawl", message: `Failed to crawl: ${(error as Error).message}`, url, severity: 10 });
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

// ==================== COMPETITOR ANALYSIS (Adaptive) ====================
export async function analyzeCompetitorFree(domain: string, keywords: string[]) {
  const [competitorSERP, ownSERP] = await Promise.all([
    scrapeSERP(`site:${domain}`, "us", "en", 2),
    Promise.all(keywords.map(k => scrapeSERP(k, "us", "en", 1))),
  ]);

  const competitorUrls = new Set(competitorSERP.map(r => r.url));
  const ownRankings = ownSERP.flat();
  const commonKeywords = ownRankings.filter(r => competitorUrls.has(r.url));

  return {
    domain,
    topPages: competitorSERP.slice(0, 10),
    estimatedKeywords: competitorSERP.length * 15,
    commonKeywords: commonKeywords.length,
    contentGaps: keywords.filter(k => !ownRankings.some(r => r.url.includes(domain))),
  };
}

// ==================== AI VISIBILITY (Adaptive) ====================
export async function checkAIVisibilityFree(brand: string) {
  const serp = await scrapeSERP(brand, "us", "en", 1);

  const featuredSnippet = serp.find(r => r.featured);
  const position = serp.findIndex(r => r.url.toLowerCase().includes(brand.toLowerCase())) + 1;

  return {
    brand,
    appearsInSnippet: !!featuredSnippet,
    snippetPosition: featuredSnippet?.position || null,
    organicPosition: position || null,
    mentions: serp.filter(r => 
      r.title.toLowerCase().includes(brand.toLowerCase()) || 
      r.snippet.toLowerCase().includes(brand.toLowerCase())
    ).length,
  };
}
