"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to democratize your SEO?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of marketers, developers, and SEO professionals building 
            the future of search together.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/pythongeek/democratic-seo-v2" target="_blank">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Github className="h-4 w-4" /> Star on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
