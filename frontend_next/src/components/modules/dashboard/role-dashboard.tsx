"use client";

import { BarChart3, FileText, FolderKanban, Users } from "lucide-react";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { PendingSummary } from "@/components/dashboard/pending-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { adminService } from "@/services/admin.service";
import type { SystemStats } from "@/types/domain";

export function RoleDashboard({ title, description, adminStats = false }: { title: string; description: string; adminStats?: boolean }) {
  const { session } = useAuth();
  const statsQuery = useApiQuery<SystemStats>(() => adminStats ? adminService.systemStats() : Promise.resolve({}), [adminStats]);
  type RawStats = {
    total_police_requests?: number;
    total_active_investigations?: number;
    total_users?: number;
    tenders?: number;
    pending_approvals?: number;
  };

  const stats = (statsQuery.data ?? {}) as RawStats;
  const cards = [
    { label: "Police requests", value: stats.total_police_requests ?? 0, icon: FileText },
    { label: "Active cases", value: stats.total_active_investigations ?? 0, icon: FolderKanban },
    { label: "Tenders", value: stats.tenders ?? 0, icon: BarChart3 },
    { label: "Users", value: stats.total_users ?? session?.user_id ?? "-", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="CivicLens" title={title} description={description} />
      <DashboardHero title={title} subtitle={description} />

      {statsQuery.loading && adminStats ? (
        <Skeleton className="h-32" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatCard key={card.label} {...card} />)}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <AnalyticsChart data={[
            { name: "Requests", value: Number(stats.total_police_requests ?? stats.police_requests ?? 0) },
            { name: "Cases", value: Number(stats.total_active_investigations ?? stats.active_cases ?? 0) },
            { name: "Tenders", value: Number(stats.tenders ?? 0) },
            { name: "Approvals", value: Number(stats.pending_approvals ?? 0) },
          ]} />

          <Card>
            <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityTimeline />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <PendingSummary />
          <Card>
            <CardHeader><CardTitle>Investigation overview</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300">
              <p>Active investigations: <strong>{stats.total_active_investigations ?? stats.active_cases ?? 0}</strong></p>
              <p>Pending approvals: <strong>{stats.pending_approvals ?? 0}</strong></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
