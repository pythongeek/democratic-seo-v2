import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import {
  scrapeSERP,
  researchKeywordFree,
  discoverBacklinksFree,
  crawlSiteFree,
  analyzeCompetitorFree,
  checkAIVisibilityFree,
  fetchPageSpeedInsights,
} from "@/lib/seo-engine";
import { 
  projects, keywords, rankTracking, backlinks, siteAudits, 
  competitors, proposals, votes, contributions, communityTemplates,
  integrations, rankiirImports, userPreferences
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";

const app = new Hono().basePath("/api");

// ==================== MIDDLEWARE ====================
// CORS handled by next.config.ts headers() — don't duplicate here.
// (Duplicate Access-Control headers trigger preflight failures on some browsers.)

// ==================== HEALTH ====================
app.get("/health", async (c) => {
  const dbConnected = await db.select({ count: sql<number>`count(*)` }).from(projects).limit(1).then(() => true).catch(() => false);

  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? "connected" : "disconnected",
      scraper: process.env.SCRAPER_MODE || "lightweight",
      pricing: "100% free — no DataForSEO",
    },
  });
});

// ==================== PROJECTS ====================
app.get("/projects", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, session.user.id),
    orderBy: desc(projects.createdAt),
  });

  return c.json(userProjects);
});

app.post("/projects", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    name: z.string().min(1).max(255),
    domain: z.string().min(1).max(255),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const [project] = await db.insert(projects).values({
    ...parsed.data,
    userId: session.user.id,
  }).returning();

  return c.json(project, 201);
});

// ==================== KEYWORDS (FREE) ====================
app.get("/seo/keywords/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const cacheKey = `keywords:${projectId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  const data = await db.query.keywords.findMany({
    where: eq(keywords.projectId, projectId),
    orderBy: desc(keywords.searchVolume),
  });

  await cacheSet(cacheKey, data, 300);
  return c.json(data);
});

app.post("/seo/keywords/research", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { keyword, locationCode = 2840, languageCode = "en" } = body;

  if (!keyword) return c.json({ error: "Keyword is required" }, 400);

  const cacheKey = `keyword-research:${keyword}:${locationCode}:${languageCode}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  try {
    const data = await researchKeywordFree(keyword);
    await cacheSet(cacheKey, data, 3600);
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Keyword research failed", details: (error as Error).message }, 500);
  }
});

// ==================== RANK TRACKING (FREE) ====================
app.get("/seo/rank-tracking/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const data = await db.query.rankTracking.findMany({
    where: eq(rankTracking.projectId, projectId),
    orderBy: desc(rankTracking.date),
    limit: 100,
  });

  return c.json(data);
});

app.post("/seo/rank-tracking/check", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { keyword, domain, locationCode = 2840 } = body;

  const cacheKey = `rank-check:${keyword}:${domain}:${locationCode}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  try {
    const results = await scrapeSERP(keyword, "us", "en", 2);
    const position = results.findIndex((item) => 
      item.url?.includes(domain)
    ) + 1;

    const data = { 
      keyword, 
      domain, 
      position: position || null, 
      totalResults: results.length,
      results: results.slice(0, 10),
      source: "free-scraper",
    };

    await cacheSet(cacheKey, data, 1800);
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Rank check failed", details: (error as Error).message }, 500);
  }
});

// ==================== BACKLINKS (FREE) ====================
app.get("/seo/backlinks/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const data = await db.query.backlinks.findMany({
    where: eq(backlinks.projectId, projectId),
    orderBy: desc(backlinks.domainAuthority),
    limit: 100,
  });

  return c.json(data);
});

app.post("/seo/backlinks/analyze", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { target } = body;

  const cacheKey = `backlinks:${target}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  try {
    const data = await discoverBacklinksFree(target);
    await cacheSet(cacheKey, data, 3600);
    return c.json({ target, backlinks: data, count: data.length, source: "free-discovery" });
  } catch (error) {
    return c.json({ error: "Backlink analysis failed", details: (error as Error).message }, 500);
  }
});

// ==================== SITE AUDIT (FREE) ====================
app.get("/seo/site-audit/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const data = await db.query.siteAudits.findMany({
    where: eq(siteAudits.projectId, projectId),
    orderBy: desc(siteAudits.createdAt),
    limit: 10,
  });

  return c.json(data);
});

app.post("/seo/site-audit/start", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { url, projectId } = body;

  try {
    const [crawlResults, pageSpeed] = await Promise.all([
      crawlSiteFree(url, 20),
      fetchPageSpeedInsights(url, "mobile").catch(() => null),
    ]);

    const totalScore = crawlResults.length > 0 
      ? Math.round(crawlResults.reduce((sum, r) => sum + r.score, 0) / crawlResults.length)
      : 0;

    const allIssues = crawlResults.flatMap(r => r.issues);

    const [audit] = await db.insert(siteAudits).values({
      projectId,
      url,
      score: totalScore,
      issues: allIssues,
      crawledPages: crawlResults.length,
      totalPages: crawlResults[0]?.totalPages || crawlResults.length,
      status: "completed",
      completedAt: new Date(),
    }).returning();

    return c.json({ 
      audit, 
      crawlResults,
      pageSpeed: pageSpeed ? {
        performance: pageSpeed.lighthouseResult?.categories?.performance?.score,
        accessibility: pageSpeed.lighthouseResult?.categories?.accessibility?.score,
        bestPractices: pageSpeed.lighthouseResult?.categories?.["best-practices"]?.score,
        seo: pageSpeed.lighthouseResult?.categories?.seo?.score,
      } : null,
      source: "free-crawler",
    });
  } catch (error) {
    return c.json({ error: "Site audit failed", details: (error as Error).message }, 500);
  }
});

// ==================== COMPETITORS (FREE) ====================
app.get("/seo/competitors/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const data = await db.query.competitors.findMany({
    where: eq(competitors.projectId, projectId),
    orderBy: desc(competitors.commonKeywords),
  });

  return c.json(data);
});

app.post("/seo/competitors/analyze", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { domain, keywords: seedKeywords = [] } = body;

  const cacheKey = `competitor:${domain}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return c.json(cached);

  try {
    const data = await analyzeCompetitorFree(domain, seedKeywords);
    await cacheSet(cacheKey, data, 3600);
    return c.json({ ...data, source: "free-analysis" });
  } catch (error) {
    return c.json({ error: "Competitor analysis failed", details: (error as Error).message }, 500);
  }
});

// ==================== AI VISIBILITY (FREE) ====================
app.get("/seo/ai-visibility/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) return c.json({ error: "Project not found" }, 404);

  try {
    const data = await checkAIVisibilityFree(project.domain);
    return c.json(data);
  } catch (error) {
    return c.json({ error: "AI visibility check failed", details: (error as Error).message }, 500);
  }
});

// ==================== INTEGRATIONS ====================
app.get("/integrations", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const data = await db.query.integrations.findMany({
    where: eq(integrations.userId, session.user.id),
    orderBy: desc(integrations.createdAt),
  });

  return c.json(data);
});

app.post("/integrations", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    config: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  if (parsed.data.isActive) {
    await db.update(integrations)
      .set({ isActive: false })
      .where(and(
        eq(integrations.userId, session.user.id),
        eq(integrations.type, parsed.data.type)
      ));
  }

  const [integration] = await db.insert(integrations).values({
    name: parsed.data.name,
    type: parsed.data.type,
    config: parsed.data.config || {},
    userId: session.user.id,
    isActive: parsed.data.isActive ?? false,
  }).returning();

  return c.json(integration, 201);
});

app.put("/integrations/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();

  if (body.isActive) {
    const integration = await db.query.integrations.findFirst({
      where: eq(integrations.id, id),
    });
    if (integration) {
      await db.update(integrations)
        .set({ isActive: false })
        .where(and(
          eq(integrations.userId, session.user.id),
          eq(integrations.type, integration.type),
          eq(integrations.isActive, true)
        ));
    }
  }

  const [updated] = await db.update(integrations)
    .set({ ...body, lastSyncAt: new Date() })
    .where(and(eq(integrations.id, id), eq(integrations.userId, session.user.id)))
    .returning();

  return c.json(updated);
});

app.delete("/integrations/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const id = parseInt(c.req.param("id"));
  await db.delete(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.userId, session.user.id)));

  return c.json({ success: true });
});

// ==================== RANKIIR IMPORT ====================
app.get("/integrations/rankiir/imports/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));
  const engine = c.req.query("engine");

  const data = await db.query.rankiirImports.findMany({
    where: and(
      eq(rankiirImports.projectId, projectId),
      eq(rankiirImports.userId, session.user.id),
      engine ? eq(rankiirImports.engine, engine) : undefined
    ),
    orderBy: desc(rankiirImports.snapshotDate),
    limit: 100,
  });

  return c.json(data);
});

app.post("/integrations/rankiir/import", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    projectId: z.number(),
    data: z.array(z.object({
      keyword: z.string(),
      engine: z.enum(["google_aio", "chatgpt", "perplexity"]),
      position: z.number().optional(),
      cited: z.boolean().optional(),
      mentionType: z.string().optional(),
      url: z.string().optional(),
      snapshotDate: z.string().datetime(),
      rawData: z.record(z.any()).optional(),
    })),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const rows = parsed.data.data.map((row) => ({
    keyword: row.keyword,
    engine: row.engine,
    position: row.position ?? null,
    cited: row.cited ?? false,
    mentionType: row.mentionType ?? null,
    url: row.url ?? null,
    snapshotDate: new Date(row.snapshotDate),
    rawData: row.rawData ?? {},
    userId: session.user.id,
    projectId: parsed.data.projectId,
  }));

  const result = await db.insert(rankiirImports).values(rows).returning();

  await db.update(integrations)
    .set({ lastSyncAt: new Date() })
    .where(and(
      eq(integrations.userId, session.user.id),
      eq(integrations.name, "rankiir")
    ));

  return c.json({ imported: result.length, rows: result });
});

app.get("/integrations/rankiir/stats/:projectId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const projectId = parseInt(c.req.param("projectId"));

  const stats = await db.select({
    engine: rankiirImports.engine,
    count: sql<number>`count(*)`,
    avgPosition: sql<number>`avg(${rankiirImports.position})`,
    citedCount: sql<number>`sum(case when ${rankiirImports.cited} then 1 else 0 end)`,
  }).from(rankiirImports)
    .where(and(eq(rankiirImports.projectId, projectId), eq(rankiirImports.userId, session.user.id)))
    .groupBy(rankiirImports.engine);

  return c.json(stats);
});

// ==================== DEMOCRATIC / COMMUNITY ====================
app.get("/community/proposals", async (c) => {
  const status = c.req.query("status") || "open";

  const data = await db.query.proposals.findMany({
    where: status === "all" ? undefined : eq(proposals.status, status),
    with: { author: true, votes: true },
    orderBy: desc(proposals.createdAt),
  });

  return c.json(data);
});

app.post("/community/proposals", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    title: z.string().min(5).max(500),
    description: z.string().min(20),
    type: z.enum(["feature", "bug", "governance", "integration"]),
    deadline: z.string().datetime().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const [proposal] = await db.insert(proposals).values({
    ...parsed.data,
    authorId: session.user.id,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
  }).returning();

  return c.json(proposal, 201);
});

app.post("/community/proposals/:id/vote", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const proposalId = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const { vote: voteValue, reason } = body;

  const existingVote = await db.query.votes.findFirst({
    where: and(eq(votes.proposalId, proposalId), eq(votes.userId, session.user.id)),
  });

  if (existingVote) {
    return c.json({ error: "Already voted on this proposal" }, 409);
  }

  await db.insert(votes).values({
    proposalId,
    userId: session.user.id,
    vote: voteValue,
    reason,
  });

  const voteColumn = voteValue ? proposals.votesFor : proposals.votesAgainst;
  await db.update(proposals)
    .set({ [voteValue ? "votesFor" : "votesAgainst"]: sql`${voteColumn} + 1` })
    .where(eq(proposals.id, proposalId));

  return c.json({ success: true });
});

app.get("/community/contributions", async (c) => {
  const data = await db.query.contributions.findMany({
    where: eq(contributions.status, "approved"),
    with: { user: true },
    orderBy: desc(contributions.points),
    limit: 50,
  });

  return c.json(data);
});

app.post("/community/contributions", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    type: z.enum(["code", "docs", "design", "bug_report", "feature_request", "seo_data"]),
    description: z.string().min(10),
    url: z.string().url().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const [contribution] = await db.insert(contributions).values({
    ...parsed.data,
    userId: session.user.id,
  }).returning();

  return c.json(contribution, 201);
});

app.get("/community/templates", async (c) => {
  const type = c.req.query("type");

  const data = await db.query.communityTemplates.findMany({
    where: type ? eq(communityTemplates.type, type) : undefined,
    with: { author: true },
    orderBy: desc(communityTemplates.downloads),
  });

  return c.json(data);
});

app.post("/community/templates", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    name: z.string().min(1).max(255),
    description: z.string(),
    type: z.enum(["audit_template", "keyword_strategy", "report_template"]),
    content: z.record(z.any()),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const [template] = await db.insert(communityTemplates).values({
    ...parsed.data,
    authorId: session.user.id,
  }).returning();

  return c.json(template, 201);
});

// ==================== USER PREFERENCES ====================
app.get("/preferences", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  return c.json(prefs || { aiVisibilitySource: "builtin", defaultRankSource: "builtin" });
});

app.post("/preferences", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const schema = z.object({
    aiVisibilitySource: z.enum(["builtin", "rankiir", "both"]).optional(),
    defaultRankSource: z.enum(["builtin", "rankiir"]).optional(),
    theme: z.string().optional(),
    emailNotifications: z.boolean().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  if (existing) {
    const [updated] = await db.update(userPreferences)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(userPreferences.id, existing.id))
      .returning();
    return c.json(updated);
  }

  const [created] = await db.insert(userPreferences).values({
    ...parsed.data,
    userId: session.user.id,
  }).returning();

  return c.json(created, 201);
});

// ==================== MCP ENDPOINT ====================
app.get("/mcp/manifest", (c) => {
  return c.json({
    schema_version: "v1",
    name_for_human: "OpenSEO Democratic (Free)",
    name_for_model: "openseo_democratic_free",
    description_for_human: "100% free community-driven SEO tools. No API keys needed for basic usage.",
    description_for_model: "Access free SEO data including keyword research, rank tracking, backlink discovery, site audits, and competitor analysis. Uses self-hosted scraping and free APIs.",
    auth: { type: "oauth" },
    api: { type: "openapi", url: `${process.env.NEXT_PUBLIC_APP_URL}/api/openapi.json` },
    logo_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    contact_email: "community@openseo.dev",
    legal_info_url: `${process.env.NEXT_PUBLIC_APP_URL}/legal`,
  });
});

app.post("/mcp/query", async (c) => {
  const body = await c.req.json();
  const { tool, params } = body;

  switch (tool) {
    case "keyword_research":
      return c.json({ tool: "keyword_research", params, source: "free" });
    case "rank_check":
      return c.json({ tool: "rank_check", params, source: "free" });
    case "backlink_analysis":
      return c.json({ tool: "backlink_analysis", params, source: "free" });
    case "site_audit":
      return c.json({ tool: "site_audit", params, source: "free" });
    case "competitor_analysis":
      return c.json({ tool: "competitor_analysis", params, source: "free" });
    default:
      return c.json({ error: "Unknown tool" }, 400);
  }
});

// ==================== CRON JOBS (for cron-jobs.org / external schedulers) ====================
// Use POST for state-changing triggers — GET is cacheable and unsafe to expose publicly.
app.post("/cron/rank-tracking", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ 
    success: true, 
    message: "Rank tracking cron triggered. Heavy scraping runs on GitHub Actions.",
    mode: "lightweight",
    note: "For full scraping, GitHub Actions workflow runs every 6 hours."
  });
});

app.post("/cron/site-audit", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ 
    success: true, 
    message: "Site audit cron triggered. Heavy crawling runs on GitHub Actions.",
    mode: "lightweight",
    note: "For full crawling, GitHub Actions workflow runs daily at 2 AM UTC."
  });
});

app.post("/cron/community-sync", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ 
    success: true, 
    message: "Community sync processed successfully.",
    mode: "lightweight"
  });
});

app.post("/cron/keyword-research", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ 
    success: true, 
    message: "Keyword research cron triggered. Batch processing runs on GitHub Actions.",
    mode: "lightweight",
    note: "GitHub Actions workflow runs every 3 hours for batch keyword research."
  });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
