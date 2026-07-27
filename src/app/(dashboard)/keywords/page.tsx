"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, TrendingUp, DollarSign, Target, Zap } from "lucide-react";

export default function KeywordsPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const research = async () => {
    if (!keyword.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seo/keywords/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), locationCode: 2840 }),
      });

      const data = await res.json();
      setResults(data);
      setHistory(prev => [data, ...prev].slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case "transactional": return "bg-red-500/10 text-red-500";
      case "commercial": return "bg-yellow-500/10 text-yellow-500";
      case "informational": return "bg-blue-500/10 text-blue-500";
      case "navigational": return "bg-purple-500/10 text-purple-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return "text-gray-500";
    if (difficulty < 30) return "text-green-500";
    if (difficulty < 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keyword Research</h1>
          <p className="text-muted-foreground mt-1">
            Free keyword research using SERP scraping and trend analysis. No API costs.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" /> Free Scraper
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discover Keywords</CardTitle>
          <CardDescription>
            Enter a seed keyword to analyze search intent, estimated difficulty, and competition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input 
              placeholder="e.g., 'best running shoes', 'how to start a blog'..." 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && research()}
              className="max-w-xl"
            />
            <Button onClick={research} disabled={loading || !keyword.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Research
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Data source: Self-hosted SERP scraper + Google Trends. Estimates are approximate.
          </p>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Results for "{results.keyword}"
              <Badge className={getIntentColor(results.intent)}>{results.intent}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Est. Volume</span>
                </div>
                <p className="text-2xl font-bold">{results.searchVolume?.toLocaleString() || "N/A"}</p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Est. CPC</span>
                </div>
                <p className="text-2xl font-bold">${results.cpc || "N/A"}</p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Difficulty</span>
                </div>
                <p className={`text-2xl font-bold ${getDifficultyColor(results.difficulty)}`}>
                  {results.difficulty || "N/A"}/100
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Competition</span>
                </div>
                <p className="text-2xl font-bold">{(results.competition * 100)?.toFixed(0) || "N/A"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getIntentColor(item.intent)}>{item.intent}</Badge>
                    <span className="font-medium">{item.keyword}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Vol: {item.searchVolume?.toLocaleString()}</span>
                    <span className={getDifficultyColor(item.difficulty)}>Diff: {item.difficulty}</span>
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
