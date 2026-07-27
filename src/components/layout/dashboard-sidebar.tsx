"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Link2,
  Globe,
  BarChart3,
  Users,
  Settings,
  Vote,
  Zap,
  Shield,
} from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/keywords", label: "Keywords", icon: Search },
  { href: "/rank-tracking", label: "Rank Tracking", icon: BarChart3 },
  { href: "/backlinks", label: "Backlinks", icon: Link2 },
  { href: "/site-audit", label: "Site Audit", icon: Shield },
  { href: "/competitors", label: "Competitors", icon: Users },
  { href: "/ai-visibility", label: "AI Visibility", icon: Zap },
  { href: "/community", label: "Community", icon: Globe },
  { href: "/governance", label: "Governance", icon: Vote },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Search className="h-5 w-5 text-primary" />
          <span>OpenSEO</span>
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
            FREE
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Scraper Mode</p>
            <span className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Lightweight (fetch + cheerio)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Heavy scraping runs on GitHub Actions. Vercel serves cached data.
          </p>
        </div>

        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary mb-1">Free Tier</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Keywords</span>
              <span>0/100 today</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Rank Checks</span>
              <span>0/200 today</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-500/5 p-3 border border-yellow-500/20">
          <p className="text-xs font-medium text-yellow-500 mb-1">Cron Jobs</p>
          <p className="text-xs text-muted-foreground">
            Using cron-jobs.org + GitHub Actions. See CRON_JOBS.md for setup.
          </p>
        </div>
      </div>
    </aside>
  );
}
