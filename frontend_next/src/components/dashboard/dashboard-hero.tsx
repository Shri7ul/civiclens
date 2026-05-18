"use client";

import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { adminService } from "@/services/admin.service";

export function DashboardHero({ title, subtitle }: { title: string; subtitle?: string }) {
  const statsQuery = useApiQuery(adminService.systemStats, []);
  const stats: any = statsQuery.data ?? {};

  return (
    <section className="rounded-xl border border-white/6 bg-gradient-to-br from-zinc-900/40 to-slate-900/30 p-6 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-400">Welcome back</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Live requests</p>
            <p className="text-lg font-bold text-white">{stats.total_police_requests ?? stats.police_requests ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Active cases</p>
            <p className="text-lg font-bold text-white">{stats.total_active_investigations ?? stats.active_cases ?? 0}</p>
          </div>
          <Button size="sm">Quick approve</Button>
          <Button size="sm" variant="ghost">View audit</Button>
        </div>
      </div>
    </section>
  );
}
