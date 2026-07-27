import { db } from "./index";
import { user, projects, proposals, communityTemplates, integrations, rankiirImports, userPreferences } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed demo user
  const [demoUser] = await db.insert(user).values({
    id: "demo-user-123",
    name: "OpenSEO Community",
    email: "community@openseo.dev",
    emailVerified: true,
    image: "https://github.com/openseo.png",
    role: "admin",
  }).onConflictDoNothing().returning();

  if (demoUser) {
    // Seed demo project
    await db.insert(projects).values({
      name: "OpenSEO Website",
      domain: "openseo.dev",
      description: "Official OpenSEO Democratic website",
      userId: demoUser.id,
      isPublic: true,
    }).onConflictDoNothing();

    // Seed demo proposals
    await db.insert(proposals).values([
      {
        title: "Add bulk keyword import feature",
        description: "Allow users to upload CSV files with keywords for batch research and tracking.",
        type: "feature",
        status: "voting",
        authorId: demoUser.id,
        votesFor: 45,
        votesAgainst: 3,
        quorum: 5,
      },
      {
        title: "Community leaderboard redesign",
        description: "Redesign the contribution leaderboard with badges and achievements.",
        type: "feature",
        status: "accepted",
        authorId: demoUser.id,
        votesFor: 32,
        votesAgainst: 1,
        quorum: 5,
      },
      {
        title: "Mobile app (React Native)",
        description: "Build a companion mobile app for iOS and Android.",
        type: "feature",
        status: "voting",
        authorId: demoUser.id,
        votesFor: 89,
        votesAgainst: 12,
        quorum: 5,
      },
    ]).onConflictDoNothing();

    // Seed demo templates
    await db.insert(communityTemplates).values([
      {
        name: "Technical SEO Audit Checklist",
        description: "Complete checklist for technical SEO audits including crawlability, indexability, and performance.",
        type: "audit_template",
        content: {
          categories: ["Crawlability", "Indexability", "Performance", "Mobile", "Security"],
          checks: [
            { item: "Robots.txt accessible", category: "Crawlability" },
            { item: "XML sitemap submitted", category: "Crawlability" },
            { item: "Canonical tags correct", category: "Indexability" },
            { item: "Core Web Vitals passing", category: "Performance" },
            { item: "Mobile responsive", category: "Mobile" },
            { item: "HTTPS enabled", category: "Security" },
          ],
        },
        authorId: demoUser.id,
        downloads: 342,
        rating: 4.8,
        isOfficial: true,
      },
      {
        name: "Keyword Research Strategy",
        description: "Template for organizing keyword research by intent, difficulty, and opportunity.",
        type: "keyword_strategy",
        content: {
          stages: ["Seed Keywords", "Expansion", "Filtering", "Prioritization"],
          metrics: ["Volume", "Difficulty", "CPC", "Intent", "SERP Features"],
        },
        authorId: demoUser.id,
        downloads: 189,
        rating: 4.5,
        isOfficial: true,
      },
    ]).onConflictDoNothing();

    // Seed demo Rankiir integration
    await db.insert(integrations).values({
      name: "rankiir",
      type: "ai_visibility",
      userId: demoUser.id,
      isActive: true,
      config: { source: "desktop_app", version: "1.0" },
    }).onConflictDoNothing();

    await db.insert(userPreferences).values({
      userId: demoUser.id,
      aiVisibilitySource: "both",
      defaultRankSource: "builtin",
      theme: "dark",
      emailNotifications: true,
    }).onConflictDoNothing();

    // Seed demo Rankiir import data
    await db.insert(rankiirImports).values([
      {
        userId: demoUser.id,
        projectId: 1,
        keyword: "best seo tools",
        engine: "google_aio",
        position: 1,
        cited: true,
        mentionType: "featured",
        url: "https://openseo.dev",
        snapshotDate: new Date(),
        rawData: { source: "rankiir_demo" },
      },
      {
        userId: demoUser.id,
        projectId: 1,
        keyword: "free keyword research",
        engine: "chatgpt",
        position: 2,
        cited: true,
        mentionType: "citation",
        url: "https://openseo.dev/blog",
        snapshotDate: new Date(),
        rawData: { source: "rankiir_demo" },
      },
      {
        userId: demoUser.id,
        projectId: 1,
        keyword: "ai seo tracker",
        engine: "perplexity",
        position: 3,
        cited: false,
        mentionType: "summary",
        url: null,
        snapshotDate: new Date(),
        rawData: { source: "rankiir_demo" },
      },
    ]).onConflictDoNothing();
  }

  console.log("✅ Seed complete!");
}

seed().catch(console.error);
