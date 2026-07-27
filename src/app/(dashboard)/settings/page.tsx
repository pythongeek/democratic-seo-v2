"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, Download, Trash2, CheckCircle, ExternalLink, 
  Cpu, Sparkles, BarChart3, RefreshCw, Loader2 
} from "lucide-react";

interface Integration {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  lastSyncAt: string | null;
  config: Record<string, any>;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: "rankiir",
    name: "Rankiir",
    type: "ai_visibility",
    description: "Free desktop app for tracking AI search visibility across Google AI Overviews, ChatGPT, and Perplexity.",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-500",
    website: "https://rankiir.com",
    github: "https://github.com/Rankiir/ai-rank-tracker",
    features: ["Google AI Overviews", "ChatGPT visibility", "Perplexity tracking", "Daily snapshots"],
    isFree: true,
  },
  {
    id: "dataforseo",
    name: "DataForSEO",
    type: "all",
    description: "Pay-as-you-go SEO data API. Optional paid enhancement for more accurate data.",
    icon: BarChart3,
    color: "bg-blue-500/10 text-blue-500",
    website: "https://dataforseo.com",
    features: ["Accurate search volume", "Real CPC data", "Backlink counts", "SERP features"],
    isFree: false,
  },
  {
    id: "builtin",
    name: "Built-in Scraper",
    type: "all",
    description: "Self-hosted Playwright scraper. 100% free, no API keys required.",
    icon: Cpu,
    color: "bg-green-500/10 text-green-500",
    features: ["SERP scraping", "Site crawling", "Keyword research", "Rank tracking"],
    isFree: true,
    isBuiltin: true,
  },
];

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState("");
  const [activeTab, setActiveTab] = useState("integrations");

  useEffect(() => {
    fetch("/api/integrations")
      .then(r => r.json())
      .then(setIntegrations)
      .catch(console.error);

    fetch("/api/preferences")
      .then(r => r.json())
      .then(setPreferences)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleIntegration = async (id: number, current: boolean) => {
    const res = await fetch(`/api/integrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setIntegrations(prev => prev.map(i => i.id === id ? updated : i));
    }
  };

  const deleteIntegration = async (id: number) => {
    if (!confirm("Delete this integration?")) return;
    const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setIntegrations(prev => prev.filter(i => i.id !== id));
    }
  };

  const addIntegration = async (integration: typeof AVAILABLE_INTEGRATIONS[0]) => {
    if (integration.isBuiltin) return;

    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: integration.id,
        type: integration.type,
        isActive: true,
        config: {},
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setIntegrations(prev => [...prev, created]);
    }
  };

  const updatePreference = async (key: string, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
  };

  const handleRankiirImport = async () => {
    if (!importData.trim()) return;
    setImporting(true);

    try {
      const parsed = JSON.parse(importData);
      const res = await fetch("/api/integrations/rankiir/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: 1, // Default project
          data: Array.isArray(parsed) ? parsed : parsed.data || [],
        }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Imported ${result.imported} rows from Rankiir!`);
        setImportData("");
      } else {
        alert("Import failed. Check your JSON format.");
      }
    } catch (e) {
      alert("Invalid JSON. Please paste valid Rankiir export data.");
    } finally {
      setImporting(false);
    }
  };

  const isConnected = (id: string) => integrations.some(i => i.name === id);
  const isActive = (id: string) => integrations.some(i => i.name === id && i.isActive);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage integrations, data sources, and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        {/* INTEGRATIONS TAB */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              const connected = isConnected(integration.id);
              const active = isActive(integration.id);

              return (
                <Card key={integration.id} className={active ? "border-primary/50" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${integration.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.isFree && <Badge variant="secondary">Free</Badge>}
                        {connected && <Badge className="bg-green-500/10 text-green-500">Connected</Badge>}
                      </div>
                    </div>
                    <CardTitle className="mt-4">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {integration.isBuiltin ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" /> Always Active
                        </Button>
                      ) : connected ? (
                        <>
                          <Button 
                            variant={active ? "default" : "outline"} 
                            className="flex-1"
                            onClick={() => {
                              const id = integrations.find(i => i.name === integration.id)?.id;
                              if (id) toggleIntegration(id, active);
                            }}
                          >
                            {active ? <CheckCircle className="h-4 w-4 mr-2" /> : <Plug className="h-4 w-4 mr-2" />}
                            {active ? "Active" : "Activate"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const id = integrations.find(i => i.name === integration.id)?.id;
                              if (id) deleteIntegration(id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => addIntegration(integration)}
                          disabled={integration.id === "dataforseo"}
                        >
                          <Plug className="h-4 w-4 mr-2" /> 
                          {integration.id === "dataforseo" ? "Coming Soon" : "Connect"}
                        </Button>
                      )}
                    </div>

                    {!integration.isBuiltin && (
                      <a 
                        href={integration.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" /> Visit website
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* DATA SOURCES TAB */}
        <TabsContent value="data-sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Visibility Source</CardTitle>
              <CardDescription>
                Choose which data source powers your AI Visibility dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Built-in Scraper</p>
                    <p className="text-sm text-muted-foreground">Free SERP scraping for featured snippets</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.aiVisibilitySource === "builtin" || preferences.aiVisibilitySource === "both"}
                  onCheckedChange={(checked) => {
                    const current = preferences.aiVisibilitySource || "builtin";
                    if (checked && current === "rankiir") updatePreference("aiVisibilitySource", "both");
                    else if (!checked && current === "both") updatePreference("aiVisibilitySource", "rankiir");
                    else if (!checked && current === "builtin") updatePreference("aiVisibilitySource", "rankiir");
                    else if (checked && current === "rankiir") updatePreference("aiVisibilitySource", "both");
                  }}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Rankiir Desktop App</p>
                    <p className="text-sm text-muted-foreground">Import data from Rankiir's free AI tracker</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.aiVisibilitySource === "rankiir" || preferences.aiVisibilitySource === "both"}
                  onCheckedChange={(checked) => {
                    const current = preferences.aiVisibilitySource || "builtin";
                    if (checked && current === "builtin") updatePreference("aiVisibilitySource", "both");
                    else if (!checked && current === "both") updatePreference("aiVisibilitySource", "builtin");
                    else if (!checked && current === "rankiir") updatePreference("aiVisibilitySource", "builtin");
                    else if (checked && current === "builtin") updatePreference("aiVisibilitySource", "both");
                  }}
                  disabled={!isConnected("rankiir")}
                />
              </div>

              {!isConnected("rankiir") && (
                <p className="text-sm text-muted-foreground">
                  Connect Rankiir in the Integrations tab to enable this source.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Rank Tracking Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Built-in Scraper</p>
                    <p className="text-sm text-muted-foreground">Free Playwright-based Google scraping</p>
                  </div>
                </div>
                <Badge>Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPORT TAB */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Import Rankiir Data
              </CardTitle>
              <CardDescription>
                Paste your Rankiir export JSON to import AI visibility data into OpenSEO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
                <p className="font-medium">How to export from Rankiir:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open Rankiir desktop app</li>
                  <li>Go to your project dashboard</li>
                  <li>Click Export → JSON</li>
                  <li>Copy the JSON and paste below</li>
                </ol>
              </div>

              <textarea
                className="w-full h-40 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={`[
  {
    "keyword": "best seo tools",
    "engine": "google_aio",
    "position": 1,
    "cited": true,
    "mentionType": "featured",
    "snapshotDate": "2026-07-27T00:00:00Z"
  }
]`}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />

              <Button 
                onClick={handleRankiirImport} 
                disabled={importing || !importData.trim()}
                className="w-full"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Import Rankiir Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
