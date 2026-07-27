"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Loader2, Search, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function SiteAuditPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startAudit = async () => {
    if (!url.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seo/site-audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), projectId: 1 }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Audit</h1>
          <p className="text-muted-foreground mt-1">
            Free technical SEO audit using self-hosted crawler + Google PageSpeed Insights.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" /> Free Crawler
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start Audit</CardTitle>
          <CardDescription>
            Crawl your site and analyze technical SEO issues, performance, and accessibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input 
              placeholder="https://example.com" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startAudit()}
              className="max-w-xl"
            />
            <Button onClick={startAudit} disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Start Audit
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Crawls up to 50 pages. Uses Playwright + PageSpeed Insights API (free tier).
          </p>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Audit Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                  <p className={`text-3xl font-bold ${result.audit.score >= 80 ? "text-green-500" : result.audit.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                    {result.audit.score}/100
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Pages Crawled</p>
                  <p className="text-3xl font-bold">{result.audit.crawledPages}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Errors</p>
                  <p className="text-3xl font-bold text-red-500">
                    {result.audit.issues?.filter((i: any) => i.type === "error").length || 0}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {result.audit.issues?.filter((i: any) => i.type === "warning").length || 0}
                  </p>
                </div>
              </div>

              {result.pageSpeed && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">PageSpeed Insights</h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { label: "Performance", score: result.pageSpeed.performance },
                      { label: "Accessibility", score: result.pageSpeed.accessibility },
                      { label: "Best Practices", score: result.pageSpeed.bestPractices },
                      { label: "SEO", score: result.pageSpeed.seo },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.label}</span>
                          <span className="font-medium">{Math.round((metric.score || 0) * 100)}</span>
                        </div>
                        <Progress value={(metric.score || 0) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {result.audit.issues?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.audit.issues.map((issue: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.message}</p>
                        <p className="text-xs text-muted-foreground">{issue.category} • {issue.url}</p>
                      </div>
                      <Badge variant={issue.severity >= 7 ? "destructive" : issue.severity >= 4 ? "default" : "secondary"}>
                        Severity {issue.severity}
                      </Badge>
                    </div>
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
