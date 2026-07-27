// ============================================================
// LIGHTWEIGHT SCRAPER — Vercel-compatible (no Playwright)
// Uses fetch + cheerio for fast SERP scraping within 10s timeout
// Heavy scraping (Playwright) moved to GitHub Actions workers
// ============================================================

import * as cheerio from "cheerio";

export interface SERPResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
  sitelinks?: string[];
  featured?: boolean;
}

// User agent rotation for stealth
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Lightweight SERP scraper using fetch + cheerio
 * Fits within Vercel's 10s hobby tier timeout
 */
export async function scrapeSERPLightweight(
  keyword: string,
  location: string = "us",
  language: string = "en",
  pages: number = 1
): Promise<SERPResult[]> {
  const results: SERPResult[] = [];

  for (let p = 0; p < pages; p++) {
    const start = p * 10;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=${language}&gl=${location}&start=${start}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": getRandomUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
      },
      // Vercel Edge runtime supports fetch with timeout
      // @ts-ignore
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`SERP fetch failed: ${response.status}`);
      continue;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse organic results
    // Google uses various selectors; we try multiple
    const resultSelectors = [
      "#search .g",                          // Classic
      "div[data-sokoban-container]",        // Modern
      ".yuRUbf",                             // Link container
      "div[data-hveid] .g",                  // Alternate
    ];

    let foundResults = false;

    for (const selector of resultSelectors) {
      $(selector).each((idx, el) => {
        const $el = $(el);

        // Try multiple title selectors
        const title = 
          $el.find("h3").first().text() ||
          $el.find(".LC20lb").first().text() ||
          $el.closest(".g").find("h3").first().text() ||
          "";

        // Try multiple link selectors
        const linkEl = $el.find("a").first() || $el.closest("a").first();
        const href = linkEl.attr("href") || "";

        // Try multiple snippet selectors
        const snippet =
          $el.find(".VwiC3b, .s3v94d, [data-sncf='1'], .st").first().text() ||
          $el.closest(".g").find(".VwiC3b").first().text() ||
          "";

        if (title && href && href.startsWith("http")) {
          results.push({
            position: start + results.filter(r => r.position <= start + 10).length + 1,
            title: title.trim(),
            url: href,
            snippet: snippet.trim(),
            featured: false,
          });
          foundResults = true;
        }
      });

      if (foundResults) break;
    }

    // Also check for featured snippets
    const featuredSnippet = $("div[data-feature='1'], .xpdopen, .g.kno-kp").first();
    if (featuredSnippet.length && p === 0) {
      const featuredTitle = featuredSnippet.find("h3, .LC20lb").first().text();
      const featuredLink = featuredSnippet.find("a").first().attr("href");
      if (featuredTitle && featuredLink) {
        results.unshift({
          position: 0,
          title: featuredTitle.trim(),
          url: featuredLink,
          snippet: featuredSnippet.text().trim().slice(0, 200),
          featured: true,
        });
      }
    }
  }

  // Deduplicate by URL and renumber
  const seen = new Set<string>();
  const unique = results.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return unique.map((r, i) => ({ ...r, position: r.position === 0 ? 0 : i + 1 }));
}

/**
 * Lightweight site crawl using fetch + cheerio
 * Single page only — for Vercel's 10s limit
 */
export async function crawlPageLightweight(url: string): Promise<{
  url: string;
  title: string;
  description: string;
  h1Count: number;
  h2Count: number;
  imagesWithoutAlt: number;
  links: string[];
  canonical: string;
  robots: string;
  loadTime: number;
  statusCode: number;
}> {
  const startTime = Date.now();

  const response = await fetch(url, {
    headers: { "User-Agent": getRandomUA() },
    // @ts-ignore
    signal: AbortSignal.timeout(5000),
  });

  const loadTime = Date.now() - startTime;
  const html = await response.text();
  const $ = cheerio.load(html);

  const links = $("a")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter(Boolean) as string[];

  const images = $("img");
  let imagesWithoutAlt = 0;
  images.each((_, el) => {
    if (!$(el).attr("alt")) imagesWithoutAlt++;
  });

  return {
    url,
    title: $("title").text().trim(),
    description: $('meta[name="description"]').attr("content") || "",
    h1Count: $("h1").length,
    h2Count: $("h2").length,
    imagesWithoutAlt,
    links,
    canonical: $('link[rel="canonical"]').attr("href") || "",
    robots: $('meta[name="robots"]').attr("content") || "",
    loadTime,
    statusCode: response.status,
  };
}

/**
 * Lightweight backlink discovery
 * Uses Google link: search via fetch
 */
export async function discoverBacklinksLightweight(domain: string): Promise<Array<{
  sourceUrl: string;
  anchorText: string;
}>> {
  const backlinks: Array<{ sourceUrl: string; anchorText: string }> = [];

  try {
    const searchUrl = `https://www.google.com/search?q=link:${encodeURIComponent(domain)}`;
    const response = await fetch(searchUrl, {
      headers: { "User-Agent": getRandomUA() },
      // @ts-ignore
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return backlinks;

    const html = await response.text();
    const $ = cheerio.load(html);

    $("#search .g a").each((_, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (href && !href.includes("google.com") && href.startsWith("http")) {
        backlinks.push({ sourceUrl: href, anchorText: text });
      }
    });
  } catch (e) {
    console.error("Backlink discovery error:", e);
  }

  return backlinks.slice(0, 50);
}

/**
 * Check if we're running on Vercel (limited timeout)
 */
export function isVercelEnvironment(): boolean {
  return !!process.env.VERCEL || process.env.SCRAPER_MODE === "lightweight";
}
