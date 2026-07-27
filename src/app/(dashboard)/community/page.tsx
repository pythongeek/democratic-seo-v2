"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Trophy, GitPullRequest, Star, Download } from "lucide-react";

export default function CommunityPage() {
  const [contributions, setContributions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community/contributions")
      .then(r => r.json())
      .then(setContributions)
      .catch(console.error);

    fetch("/api/community/templates")
      .then(r => r.json())
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Contributions, templates, and leaderboards from the OpenSEO community.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Globe className="h-3 w-3" /> {contributions.length} Contributors
        </Badge>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="submit">Submit</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contributions.length > 0 ? (
                <div className="space-y-2">
                  {contributions.slice(0, 10).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{c.user?.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">{c.type} • {c.description?.slice(0, 50)}...</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{c.points} pts</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No contributions yet. Be the first!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.length > 0 ? (
              templates.map((t: any, i: number) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{t.name}</CardTitle>
                      {t.isOfficial && <Badge>Official</Badge>}
                    </div>
                    <CardDescription>{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {t.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> {t.rating || "N/A"}
                      </span>
                    </div>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      Download Template
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground col-span-full py-8">No templates yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Contribution</CardTitle>
              <CardDescription>
                Earn reputation points by contributing code, docs, designs, or SEO data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submit via the API or open a Pull Request on GitHub. 
                All contributions are reviewed by the community.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
