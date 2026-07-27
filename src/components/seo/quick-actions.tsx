"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, BarChart3, Link2, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

const actions = [
  { title: "Keyword Research", description: "Find new keywords", icon: Search, href: "/keywords", color: "bg-blue-500/10 text-blue-500" },
  { title: "Rank Check", description: "Check positions", icon: BarChart3, href: "/rank-tracking", color: "bg-green-500/10 text-green-500" },
  { title: "Backlinks", description: "Discover links", icon: Link2, href: "/backlinks", color: "bg-purple-500/10 text-purple-500" },
  { title: "Site Audit", description: "Audit website", icon: Shield, href: "/site-audit", color: "bg-orange-500/10 text-orange-500" },
];

export function QuickActions() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
