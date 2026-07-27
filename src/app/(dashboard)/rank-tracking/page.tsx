"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, CheckCircle, Loader2, Search, ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function RankTrackingPage() {
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<any[]>([]);

  const checkRank = async () => {
    if (!keyword.trim() || !domain.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seo/rank-tracking/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), domain: domain.trim() }),
      });

      const data = await res.json();
      setResult(data);
      if (data.position) {
        setChecks(prev => [data, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (pos: number) => {
    if (pos <= 3) return "text-green-500";
    if (pos <= 10) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rank Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Check your website's position for any keyword using free SERP scraping.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <BarChart className="h-3 w-3" /> Free Scraper
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Ranking</CardTitle>
          <CardDescription>
            Scrape Google SERPs in real-time to find your exact position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword</label>
              <Input 
                placeholder="e.g., 'best coffee maker'" 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Domain</label>
              <Input 
                placeholder="e.g., 'example.com'" 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={checkRank} disabled={loading || !keyword.trim() || !domain.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Check Position
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.position ? "border-green-500/20" : "border-yellow-500/20"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.position ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Search className="h-5 w-5 text-yellow-500" />
              )}
              Result for "{result.keyword}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.position ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">Your position on Google</p>
                <p className={`text-6xl font-bold ${getPositionColor(result.position)}`}>
                  #{result.position}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  out of {result.totalResults} results checked
                </p>
                <div className="mt-6 rounded-lg bg-muted p-4 max-w-md mx-auto">
                  <p className="text-sm font-medium mb-2">Top 10 Results</p>
                  <div className="space-y-1">
                    {result.results?.slice(0, 10).map((r: any, i: number) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-2 text-xs p-1 rounded ${
                          r.url?.includes(result.domain) ? "bg-primary/10 text-primary font-medium" : ""
                        }`}
                      >
                        <span className="w-5 text-right text-muted-foreground">{r.position}.</span>
                        <span className="truncate flex-1">{r.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Not in top results</p>
                <p className="text-sm text-muted-foreground">
                  Your domain wasn't found in the first {result.totalResults} results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {checks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{check.keyword}</p>
                    <p className="text-xs text-muted-foreground">{check.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.position ? (
                      <>
                        <span className={`text-lg font-bold ${getPositionColor(check.position)}`}>
                          #{check.position}
                        </span>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not found</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
