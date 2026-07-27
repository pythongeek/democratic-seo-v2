"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Link2, Shield, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  { title: "Tracked Keywords", value: "0", icon: Search, change: "+12", trend: "up" },
  { title: "Avg. Position", value: "—", icon: BarChart3, change: "—", trend: "neutral" },
  { title: "Backlinks", value: "0", icon: Link2, change: "+5", trend: "up" },
  { title: "Site Health", value: "—", icon: Shield, change: "—", trend: "neutral" },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : ""}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
