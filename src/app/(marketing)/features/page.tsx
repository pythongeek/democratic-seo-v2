import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Link2, Shield, Zap, Users, Vote, Code, Sparkles } from "lucide-react";

const features = [
  { icon: Search, title: "Keyword Research", desc: "Free keyword discovery using SERP scraping and trend analysis." },
  { icon: BarChart3, title: "Rank Tracking", desc: "Self-hosted Playwright scraper checks Google positions." },
  { icon: Link2, title: "Backlink Discovery", desc: "Find links using free Google search + optional Bing API." },
  { icon: Shield, title: "Site Audits", desc: "Comprehensive crawler + PageSpeed Insights." },
  { icon: Zap, title: "AI Visibility", desc: "Track brand in featured snippets and AI results." },
  { icon: Users, title: "Competitor Analysis", desc: "Content gap analysis via scraping." },
  { icon: Vote, title: "Democratic Governance", desc: "Vote on features, propose changes, earn points." },
  { icon: Code, title: "MCP Server", desc: "Connect Claude, OpenClaw to your SEO data." },
  { icon: Sparkles, title: "Community Templates", desc: "Share SEO templates and strategies." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">Features</h1>
          <p className="mt-4 text-lg text-muted-foreground">Every feature is 100% free. No paid APIs.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title}>
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
