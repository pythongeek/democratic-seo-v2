import { ProjectSelector } from "@/components/seo/project-selector";
import { StatsCards } from "@/components/seo/stats-cards";
import { RecentActivity } from "@/components/seo/recent-activity";
import { QuickActions } from "@/components/seo/quick-actions";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <ProjectSelector />
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}
