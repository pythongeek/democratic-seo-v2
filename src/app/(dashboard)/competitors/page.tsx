"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Search, Globe, ArrowRight, Target } from "lucide-react";

export default function CompetitorsPage() {
  const [domain, setDomain] = useState("");
  const [seedKeywords, setSeedKeywords] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!domain.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seo/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          domain: domain.trim(),
          keywords: seedKeywords.split(",").map(k => k.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      setResult(data);
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
          <h1 className="text-3xl font-bold">Competitor Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Analyze competitor domains using free SERP scraping and content gap detection.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" /> Free Analysis
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Competitor</CardTitle>
          <CardDescription>
            Enter a competitor domain and optional seed keywords to find content gaps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Competitor Domain</label>
              <Input 
                placeholder="e.g., 'competitor.com'" 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seed Keywords (comma separated)</label>
              <Input 
                placeholder="e.g., 'seo tools, keyword research'" 
                value={seedKeywords} 
                onChange={(e) => setSeedKeywords(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={analyze} disabled={loading || !domain.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Analyze
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {result.domain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-1">Top Pages Found</p>
                  <p className="text-2xl font-bold">{result.topPages?.length || 0}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-1">Est. Keywords</p>
                  <p className="text-2xl font-bold">{result.estimatedKeywords?.toLocaleString() || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-1">Common Keywords</p>
                  <p className="text-2xl font-bold">{result.commonKeywords || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.topPages?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.topPages.slice(0, 10).map((page: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{page.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">Pos: {page.position}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.contentGaps?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-500" />
                  Content Gaps
                </CardTitle>
                <CardDescription>
                  Keywords your competitor ranks for that you might be missing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.contentGaps.map((gap: string, i: number) => (
                    <Badge key={i} variant="secondary">{gap}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
