#!/usr/bin/env tsx
// ============================================================
// SCRAPER WORKER — Runs on GitHub Actions (free tier)
// Heavy scraping with Playwright that saves results to DB
// Also supports being triggered by cron-jobs.org HTTP calls
// ============================================================

// Use relative imports so tsx can resolve without tsconfig-paths
import { db } from "../db/index.js";
import { redis } from "../lib/redis.js";
import { projects, keywords, rankTracking, siteAudits, integrations, rankiirImports, userPreferences } from "../db/schema.js";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { 
  scrapeSERP, 
  researchKeywordFree, 
  crawlSiteFree,
  checkAIVisibilityFree 
} from "../lib/seo-engine.js";

const TASK = process.argv.find(a => a.startsWith("--task="))?.replace("--task=", "") || "all";
const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;

async function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function postToAPI(endpoint: string, data: any) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CRON_SECRET}`,
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    log(`API post failed: ${e}`);
    return false;
  }
}

// ==================== RANK TRACKING ====================
async function runRankTracking() {
  log("Starting rank tracking batch...");

  const trackedKeywords = await db.select().from(rankTracking)
    .where(isNull(rankTracking.position))
    .limit(50);

  if (trackedKeywords.length === 0) {
    log("No pending rank checks found.");
    return;
  }

  log(`Found ${trackedKeywords.length} keywords to check`);

  for (const track of trackedKeywords) {
    try {
      const results = await scrapeSERP(track.keyword, "us", "en", 2);
      const position = results.findIndex((item: any) => 
        item.url?.includes(track.domain)
      ) + 1;

      await db.update(rankTracking)
        .set({ 
          position: position || null,
          previousPosition: track.position,
          url: position ? results[position - 1]?.url : null,
          date: new Date(),
        })
        .where(eq(rankTracking.id, track.id));

      await redis.set(
        `rank-check:${track.keyword}:${track.domain}`,
        JSON.stringify({ position, totalResults: results.length }),
        { ex: 1800 }
      );

      log(`✓ ${track.keyword} → Position ${position || "N/A"} for ${track.domain}`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      log(`✗ Failed: ${track.keyword} — ${e}`);
    }
  }

  log("Rank tracking batch complete!");
}

// ==================== SITE AUDIT ====================
async function runSiteAudit() {
  log("Starting site audit batch...");

  const pendingAudits = await db.select().from(siteAudits)
    .where(eq(siteAudits.status, "pending"))
    .limit(10);

  if (pendingAudits.length === 0) {
    log("No pending site audits found.");
    return;
  }

  for (const audit of pendingAudits) {
    try {
      await db.update(siteAudits)
        .set({ status: "running" })
        .where(eq(siteAudits.id, audit.id));

      const crawlResults = await crawlSiteFree(audit.url, 50);

      const totalScore = crawlResults.length > 0 
        ? Math.round(crawlResults.reduce((sum: number, r: any) => sum + r.score, 0) / crawlResults.length)
        : 0;

      const allIssues = crawlResults.flatMap((r: any) => r.issues);

      await db.update(siteAudits)
        .set({
          score: totalScore,
          issues: allIssues,
          crawledPages: crawlResults.length,
          totalPages: crawlResults[0]?.totalPages || crawlResults.length,
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(siteAudits.id, audit.id));

      log(`✓ Audited ${audit.url} → Score ${totalScore}/100`);
    } catch (e) {
      await db.update(siteAudits)
        .set({ status: "failed" })
        .where(eq(siteAudits.id, audit.id));
      log(`✗ Failed audit: ${audit.url} — ${e}`);
    }
  }

  log("Site audit batch complete!");
}

// ==================== KEYWORD RESEARCH ====================
async function runKeywordResearch() {
  log("Starting keyword research batch...");

  const pendingKeywords = await db.select().from(keywords)
    .where(isNull(keywords.searchVolume))
    .limit(50);

  if (pendingKeywords.length === 0) {
    log("No pending keyword research found.");
    return;
  }

  for (const kw of pendingKeywords) {
    try {
      const data = await researchKeywordFree(kw.keyword);

      await db.update(keywords)
        .set({
          searchVolume: data.searchVolume,
          cpc: data.cpc,
          competition: data.competition,
          difficulty: data.difficulty,
          intent: data.intent,
          trends: data.trends,
          lastUpdated: new Date(),
        })
        .where(eq(keywords.id, kw.id));

      log(`✓ ${kw.keyword} → Vol: ${data.searchVolume}, Diff: ${data.difficulty}`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      log(`✗ Failed: ${kw.keyword} — ${e}`);
    }
  }

  log("Keyword research batch complete!");
}

// ==================== COMMUNITY SYNC ====================
async function runCommunitySync() {
  log("Starting community sync...");

  const pendingCount = await db.select({ count: sql<number>`count(*)` })
    .from(sql`contributions`)
    .where(sql`status = 'pending'`);

  log(`Found ${pendingCount[0]?.count || 0} pending contributions`);
  log("Community sync complete!");
}

// ==================== MAIN ====================
async function main() {
  log(`=== OpenSEO Scraper Worker ===`);
  log(`Task: ${TASK}`);
  log(`Mode: ${process.env.SCRAPER_MODE || "heavy"}`);
  log(`API: ${API_URL}`);

  const tasks: Record<string, () => Promise<void>> = {
    "rank-tracking": runRankTracking,
    "site-audit": runSiteAudit,
    "keyword-research": runKeywordResearch,
    "community-sync": runCommunitySync,
  };

  if (TASK === "all") {
    for (const [name, fn] of Object.entries(tasks)) {
      log(`\n--- Running: ${name} ---`);
      await fn();
    }
  } else if (tasks[TASK]) {
    await tasks[TASK]();
  } else {
    log(`Unknown task: ${TASK}`);
    log(`Available: ${Object.keys(tasks).join(", ")}`);
    process.exit(1);
  }

  log("\n=== All tasks complete ===");
  process.exit(0);
}

main().catch((e) => {
  console.error("Worker failed:", e);
  process.exit(1);
});
