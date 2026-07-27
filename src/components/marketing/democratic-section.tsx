"use client";

import { motion } from "framer-motion";
import { Vote, GitPullRequest, MessageSquare, Heart } from "lucide-react";

const principles = [
  {
    icon: Vote,
    title: "Feature Voting",
    description: "Propose and vote on new features. The community decides what gets built next.",
  },
  {
    icon: GitPullRequest,
    title: "Open Contributions",
    description: "Contribute code, docs, or SEO data. Earn reputation and governance rights.",
  },
  {
    icon: MessageSquare,
    title: "Transparent Roadmap",
    description: "Public roadmap with clear priorities. No hidden agendas or corporate interests.",
  },
  {
    icon: Heart,
    title: "Community Templates",
    description: "Share and discover SEO templates, strategies, and reports from the community.",
  },
];

export function DemocraticSection() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Democratic SEO means{" "}
              <span className="text-primary">you're in control</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Unlike closed-source tools that dictate pricing and features, OpenSEO Democratic 
              puts power in the hands of its users. Vote on the roadmap, contribute code, 
              and help shape the future of SEO tooling.
            </p>

            <div className="space-y-6">
              {principles.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <div key={principle.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{principle.title}</h3>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-2xl border bg-muted/50 p-8"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Active Proposals</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  12 Open
                </span>
              </div>

              {[
                { title: "Add Ahrefs API integration", votes: 45, status: "voting" },
                { title: "Community leaderboard redesign", votes: 32, status: "accepted" },
                { title: "Bulk keyword import feature", votes: 67, status: "voting" },
                { title: "Mobile app (React Native)", votes: 89, status: "voting" },
              ].map((proposal) => (
                <div key={proposal.title} className="rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{proposal.title}</span>
                    <span className={`
                      rounded-full px-2 py-0.5 text-xs font-medium
                      ${proposal.status === "accepted" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}
                    `}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Vote className="h-3 w-3" />
                    <span>{proposal.votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
