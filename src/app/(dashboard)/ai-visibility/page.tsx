"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Loader2, Search, Sparkles, Eye, EyeOff, 
  Cpu, TrendingUp, BarChart3, ExternalLink 
} from "lucide-react";

export default function AIVisibilityPage() {
  const [brand, setBrand] = useState("");
  const [builtinResult, setBuiltinResult] = useState<any>(null);
  const [rankiirData, setRankiirData] = useState<any[]>([]);
  const [rankiirStats, setRankiirStats] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>({ aiVisibilitySource: "builtin" });
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string>("builtin");

  useEffect(() => {
    fetch("/api/preferences")
      .then(r => r.json())
      .then(prefs => {
        setPreferences(prefs);
        setActiveSource(prefs.aiVisibilitySource || "builtin");
      })
      .catch(console.error);

    // Load Rankiir data if connected
    fetch("/api/integrations/rankiir/stats/1")
      .then(r => r.ok ? r.json() : [])
      .then(setRankiirStats)
      .catch(() => {});

    fetch("/api/integrations/rankiir/imports/1")
      .then(r => r.ok ? r.json() : [])
      .then(setRankiirData)
      .catch(() => {});
  }, []);

  const checkBuiltin = async () => {
    if (!brand.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/seo/ai-visibility/1?brand=${encodeURIComponent(brand.trim())}`);
      const data = await res.json();
      setBuiltinResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadge = () => {
    switch (activeSource) {
      case "builtin": return <Badge variant="outline" className="gap-1"><Cpu className="h-3 w-3" /> Built-in</Badge>;
      case "rankiir": return <Badge variant="outline" className="gap-1 text-purple-500"><Sparkles className="h-3 w-3" /> Rankiir</Badge>;
      case "both": return <Badge variant="outline" className="gap-1"><Cpu className="h-3 w-3" /> + <Sparkles className="h-3 w-3" /> Both</Badge>;
      default: return null;
    }
  };

  const showBuiltin = activeSource === "builtin" || activeSource === "both";
  const showRankiir = activeSource === "rankiir" || activeSource === "both";

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Visibility</h1>
          <p className="text-muted-foreground mt-1">
            Track how your brand appears in AI search results, featured snippets, and LLM responses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getSourceBadge()}
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/settings"}>
            <Cpu className="h-3 w-3 mr-1" /> Switch Source
          </Button>
        </div>
      </div>

      {/* Source Selector Tabs */}
      <Tabs value={activeSource} onValueChange={setActiveSource}>
        <TabsList>
          <TabsTrigger value="builtin">Built-in Scraper</TabsTrigger>
          <TabsTrigger value="rankiir">Rankiir Import</TabsTrigger>
          <TabsTrigger value="both">Both Sources</TabsTrigger>
        </TabsList>

        {/* BUILT-IN SOURCE */}
        {(showBuiltin) && (
          <TabsContent value={activeSource === "both" ? "both" : "builtin"} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-green-500" />
                  Built-in AI Visibility Check
                </CardTitle>
                <CardDescription>
                  Scrape Google SERPs to detect featured snippets and brand mentions. 100% free.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Your brand or company name" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && checkBuiltin()}
                    className="max-w-xl"
                  />
                  <Button onClick={checkBuiltin} disabled={loading || !brand.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Check
                  </Button>
                </div>
              </CardContent>
            </Card>

            {builtinResult && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className={builtinResult.appearsInSnippet ? "border-green-500/20" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {builtinResult.appearsInSnippet ? (
                        <Eye className="h-5 w-5 text-green-500" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      )}
                      Featured Snippet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {builtinResult.appearsInSnippet ? "Visible" : "Not Found"}
                    </p>
                    {builtinResult.snippetPosition && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Position: #{builtinResult.snippetPosition}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className={builtinResult.organicPosition ? "border-green-500/20" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Organic Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {builtinResult.organicPosition ? `#${builtinResult.organicPosition}` : "Not in top results"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {builtinResult.mentions} mentions in top results
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )}

        {/* RANKIIR SOURCE */}
        {(showRankiir) && (
          <TabsContent value={activeSource === "both" ? "both" : "rankiir"} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Rankiir AI Visibility Data
                </CardTitle>
                <CardDescription>
                  Data imported from Rankiir's free desktop app. Tracks Google AI Overviews, ChatGPT, and Perplexity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rankiirStats.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {rankiirStats.map((stat: any, i: number) => (
                      <div key={i} className="rounded-lg bg-muted p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1 capitalize">{stat.engine.replace("_", " ")}</p>
                        <p className="text-2xl font-bold">{stat.count}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg Pos: {stat.avgPosition ? `#${Number(stat.avgPosition).toFixed(1)}` : "N/A"} • 
                          Cited: {stat.citedCount || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No Rankiir data yet</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                      Download the free Rankiir desktop app, export your data as JSON, 
                      and import it in Settings → Import Data.
                    </p>
                    <div className="flex justify-center gap-3 mt-4">
                      <a href="https://rankiir.com" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" /> Download Rankiir</Button>
                      </a>
                      <Button onClick={() => window.location.href = "/settings"}>
                        <TrendingUp className="h-4 w-4 mr-2" /> Import Data
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {rankiirData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Rankiir Snapshots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rankiirData.slice(0, 20).map((row: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {row.engine.replace("_", " ")}
                          </Badge>
                          <span className="font-medium text-sm">{row.keyword}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {row.position && <span>Pos: #{row.position}</span>}
                          {row.cited && <Badge className="bg-green-500/10 text-green-500">Cited</Badge>}
                          <span className="text-muted-foreground text-xs">
                            {new Date(row.snapshotDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Comparison Card (only when both sources active) */}
      {activeSource === "both" && rankiirStats.length > 0 && builtinResult && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Source Comparison
            </CardTitle>
            <CardDescription>
              Compare Built-in scraper vs Rankiir data for the same keywords.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-green-500/5 p-4 border border-green-500/20">
                <p className="font-medium text-green-500 mb-2">Built-in Scraper</p>
                <p className="text-sm text-muted-foreground">Real-time SERP scraping</p>
                <p className="text-sm">Featured snippets: {builtinResult.appearsInSnippet ? "Yes" : "No"}</p>
                <p className="text-sm">Organic position: {builtinResult.organicPosition ? `#${builtinResult.organicPosition}` : "N/A"}</p>
              </div>
              <div className="rounded-lg bg-purple-500/5 p-4 border border-purple-500/20">
                <p className="font-medium text-purple-500 mb-2">Rankiir Desktop</p>
                <p className="text-sm text-muted-foreground">AI-specific tracking</p>
                <p className="text-sm">Google AIO: {rankiirStats.find((s: any) => s.engine === "google_aio")?.count || 0} snapshots</p>
                <p className="text-sm">ChatGPT: {rankiirStats.find((s: any) => s.engine === "chatgpt")?.count || 0} snapshots</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
