"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Link2, Shield, Clock } from "lucide-react";

const activities = [
  { action: "Keyword research completed", detail: "'best running shoes' — 12,400 est. volume", time: "2 min ago", icon: Search },
  { action: "Rank check performed", detail: "Position #4 for 'seo tools free'", time: "1 hour ago", icon: BarChart3 },
  { action: "Backlink discovered", detail: "New link from example-blog.com", time: "3 hours ago", icon: Link2 },
  { action: "Site audit completed", detail: "Score: 78/100 — 3 errors found", time: "5 hours ago", icon: Shield },
];

export function RecentActivity() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
