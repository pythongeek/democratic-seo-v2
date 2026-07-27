import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Server, Database, Code, Shield } from "lucide-react";

const docs = [
  { icon: BookOpen, title: "Getting Started", desc: "Deploy to Vercel in 5 minutes." },
  { icon: Server, title: "Self-Hosted Scraping", desc: "Configure Playwright for SERP scraping." },
  { icon: Database, title: "Database Schema", desc: "PostgreSQL with Drizzle ORM." },
  { icon: Code, title: "API Reference", desc: "REST endpoints for all SEO tools." },
  { icon: Shield, title: "MCP Integration", desc: "Connect AI agents." },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">Documentation</h1>
          <p className="mt-4 text-lg text-muted-foreground">Deploy, customize, and contribute.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {docs.map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.title} className="hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{d.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{d.desc}</p></CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
