"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Users, Vote } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            <Vote className="h-4 w-4 text-primary" />
            <span>Community-Driven & Democratic</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            SEO tools built{" "}
            <span className="text-primary">by the people</span>,{" "}
            for the people
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Open source alternative to Semrush and Ahrefs. No subscriptions. 
            No gatekeeping. Community governance, transparent pricing, and full control.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/pythongeek/democratic-seo-v2" target="_blank">
              <Button size="lg" variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> View on GitHub
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Keyword Research</span>
            </div>
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              <span>Community Votes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Open Governance</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
    </section>
  );
}
