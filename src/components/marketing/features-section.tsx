"use client";

import { motion } from "framer-motion";
import { Search, BarChart3, Link2, Shield, Zap, Users, Vote, Code } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Keyword Research",
    description: "Discover high-value keywords with search volume, CPC, competition, and intent analysis.",
  },
  {
    icon: BarChart3,
    title: "Rank Tracking",
    description: "Monitor your rankings across locations and devices with automated daily updates.",
  },
  {
    icon: Link2,
    title: "Backlink Analysis",
    description: "Analyze your backlink profile, discover new opportunities, and monitor link health.",
  },
  {
    icon: Shield,
    title: "Site Audits",
    description: "Comprehensive technical SEO audits with actionable recommendations and issue tracking.",
  },
  {
    icon: Zap,
    title: "AI Visibility",
    description: "Track how your brand appears in AI search results and LLM responses.",
  },
  {
    icon: Users,
    title: "Competitor Analysis",
    description: "Compare your SEO performance against competitors and identify content gaps.",
  },
  {
    icon: Vote,
    title: "Democratic Governance",
    description: "Vote on features, propose changes, and shape the roadmap through community consensus.",
  },
  {
    icon: Code,
    title: "MCP & AI Agents",
    description: "Connect Claude, OpenClaw, or any MCP-compatible agent directly to your SEO data.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for SEO
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            All the tools you'd expect from enterprise SEO platforms, built with transparency and community input.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl border bg-background p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
