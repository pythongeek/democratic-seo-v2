import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, real, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== AUTH (Better Auth) ====================
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== PROJECTS ====================
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  description: text("description"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").notNull().default(false),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("projects_user_id_idx").on(table.userId),
  index("projects_domain_idx").on(table.domain),
]);

// ==================== KEYWORD RESEARCH ====================
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  locationCode: integer("location_code").notNull().default(2840),
  languageCode: varchar("language_code", { length: 10 }).notNull().default("en"),
  searchVolume: integer("search_volume"),
  cpc: real("cpc"),
  competition: real("competition"),
  difficulty: integer("difficulty"),
  intent: varchar("intent", { length: 50 }),
  trends: jsonb("trends").default([]),
  serpFeatures: jsonb("serp_features").default([]),
  dataSource: varchar("data_source", { length: 50 }).default("free-scraper"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("keywords_project_id_idx").on(table.projectId),
  uniqueIndex("keywords_project_keyword_idx").on(table.projectId, table.keyword),
]);

// ==================== RANK TRACKING ====================
export const rankTracking = pgTable("rank_tracking", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  keywordId: integer("keyword_id").references(() => keywords.id, { onDelete: "set null" }),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  position: integer("position"),
  previousPosition: integer("previous_position"),
  url: text("url"),
  searchVolume: integer("search_volume"),
  locationCode: integer("location_code").notNull().default(2840),
  languageCode: varchar("language_code", { length: 10 }).notNull().default("en"),
  date: timestamp("date").notNull().defaultNow(),
  dataSource: varchar("data_source", { length: 50 }).default("free-scraper"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("rank_tracking_project_id_idx").on(table.projectId),
  index("rank_tracking_date_idx").on(table.date),
]);

// ==================== BACKLINKS ====================
export const backlinks = pgTable("backlinks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  anchorText: text("anchor_text"),
  dofollow: boolean("dofollow").notNull().default(true),
  domainAuthority: integer("domain_authority"),
  pageAuthority: integer("page_authority"),
  discoveryMethod: varchar("discovery_method", { length: 50 }).default("google-link-search"),
  firstSeen: timestamp("first_seen").notNull().defaultNow(),
  lastChecked: timestamp("last_checked").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("backlinks_project_id_idx").on(table.projectId),
  index("backlinks_target_url_idx").on(table.targetUrl),
]);

// ==================== SITE AUDITS ====================
export const siteAudits = pgTable("site_audits", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  score: integer("score"),
  issues: jsonb("issues").default([]),
  crawledPages: integer("crawled_pages"),
  totalPages: integer("total_pages"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  lighthouseScores: jsonb("lighthouse_scores").default({}),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("site_audits_project_id_idx").on(table.projectId),
]);

// ==================== COMPETITORS ====================
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  domain: varchar("domain", { length: 255 }).notNull(),
  commonKeywords: integer("common_keywords"),
  theirKeywords: integer("their_keywords"),
  ourKeywords: integer("our_keywords"),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("competitors_project_id_idx").on(table.projectId),
  uniqueIndex("competitors_project_domain_idx").on(table.projectId, table.domain),
]);

// ==================== DEMOCRATIC / COMMUNITY ====================
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  votesFor: integer("votes_for").notNull().default(0),
  votesAgainst: integer("votes_against").notNull().default(0),
  quorum: integer("quorum").notNull().default(5),
  deadline: timestamp("deadline"),
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("proposals_status_idx").on(table.status),
  index("proposals_author_id_idx").on(table.authorId),
]);

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  vote: boolean("vote").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("votes_proposal_user_idx").on(table.proposalId, table.userId),
]);

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  url: text("url"),
  points: integer("points").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("contributions_user_id_idx").on(table.userId),
  index("contributions_status_idx").on(table.status),
]);

export const communityTemplates = pgTable("community_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  content: jsonb("content").notNull(),
  authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  downloads: integer("downloads").notNull().default(0),
  rating: real("rating").default(0),
  isOfficial: boolean("is_official").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("community_templates_type_idx").on(table.type),
  index("community_templates_author_idx").on(table.authorId),
]);

// ==================== INTEGRATIONS (Rankiir, etc.) ====================
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").default({}),
  isActive: boolean("is_active").notNull().default(false),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("integrations_user_id_idx").on(table.userId),
  uniqueIndex("integrations_user_name_idx").on(table.userId, table.name),
]);

export const rankiirImports = pgTable("rankiir_imports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  engine: varchar("engine", { length: 50 }).notNull(),
  position: integer("position"),
  cited: boolean("cited").default(false),
  mentionType: varchar("mention_type", { length: 50 }),
  url: text("url"),
  snapshotDate: timestamp("snapshot_date").notNull(),
  rawData: jsonb("raw_data").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("rankiir_imports_user_id_idx").on(table.userId),
  index("rankiir_imports_project_id_idx").on(table.projectId),
  index("rankiir_imports_engine_idx").on(table.engine),
]);

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  aiVisibilitySource: varchar("ai_visibility_source", { length: 50 }).notNull().default("builtin"),
  defaultRankSource: varchar("default_rank_source", { length: 50 }).notNull().default("builtin"),
  theme: varchar("theme", { length: 20 }).notNull().default("system"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("user_preferences_user_id_idx").on(table.userId),
]);

// ==================== RELATIONS ====================
export const userRelations = relations(user, ({ many }) => ({
  projects: many(projects),
  proposals: many(proposals),
  votes: many(votes),
  contributions: many(contributions),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(user, { fields: [projects.userId], references: [user.id] }),
  keywords: many(keywords),
  rankTracking: many(rankTracking),
  backlinks: many(backlinks),
  siteAudits: many(siteAudits),
  competitors: many(competitors),
}));

export const proposalRelations = relations(proposals, ({ one, many }) => ({
  author: one(user, { fields: [proposals.authorId], references: [user.id] }),
  votes: many(votes),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  user: one(user, { fields: [contributions.userId], references: [user.id] }),
}));

export const communityTemplateRelations = relations(communityTemplates, ({ one }) => ({
  author: one(user, { fields: [communityTemplates.authorId], references: [user.id] }),
}));

export const integrationRelations = relations(integrations, ({ one }) => ({
  user: one(user, { fields: [integrations.userId], references: [user.id] }),
}));

export const rankiirImportRelations = relations(rankiirImports, ({ one }) => ({
  user: one(user, { fields: [rankiirImports.userId], references: [user.id] }),
  project: one(projects, { fields: [rankiirImports.projectId], references: [projects.id] }),
}));
