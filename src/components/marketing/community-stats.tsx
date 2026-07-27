"use client";

import { motion } from "framer-motion";
import { Users, GitPullRequest, Vote, Globe } from "lucide-react";

const stats = [
  { icon: Users, value: "2,400+", label: "Community Members" },
  { icon: GitPullRequest, value: "340+", label: "Contributions" },
  { icon: Vote, value: "89", label: "Proposals Voted" },
  { icon: Globe, value: "12k+", label: "Websites Analyzed" },
];

export function CommunityStats() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
