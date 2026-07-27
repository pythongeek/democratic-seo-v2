"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Loader2, Search, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

export default function BacklinksPage() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!domain.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seo/backlinks/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: domain.trim() }),
      });

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backlink Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Find who links to your site using free Google link search and Bing API.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Link2 className="h-3 w-3" /> Free Discovery
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Backlinks</CardTitle>
          <CardDescription>
            Discover referring domains. Results may be limited compared to paid tools, but completely free.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input 
              placeholder="e.g., 'example.com' (without https://)" 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              className="max-w-xl"
            />
            <Button onClick={analyze} disabled={loading || !domain.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Discover
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sources: Google link: search, Bing Web Search API (if configured). No paid backlink APIs used.
          </p>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Backlinks for {results.target}
              <Badge variant="secondary">{results.count} found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.backlinks?.length > 0 ? (
              <div className="space-y-2">
                {results.backlinks.map((link: any, i: number) => (
                  <div key={i} className="flex items-start justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{link.sourceUrl}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Anchor: {link.anchorText || "N/A"} • 
                        <span className={link.dofollow ? "text-green-500" : "text-yellow-500"}>
                          {link.dofollow ? " Dofollow" : " Nofollow"}
                        </span>
                      </p>
                    </div>
                    <a href={link.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No backlinks found</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                  Free discovery has limitations. Try adding Bing API key for better results, 
                  or use Google Search Console for your own sites.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
