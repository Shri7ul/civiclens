"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { adminService } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function ActivityTimeline() {
  const query = useApiQuery(adminService.auditLogs, []);
  if (query.loading) return <Skeleton className="h-48" />;
  if (query.error) return <EmptyState title="Could not load activity" description={String(query.error)} />;
  if (!query.data?.length) return <EmptyState title="No activity" description="No recent audit events." />;

  return (
    <div className="space-y-3">
      {query.data.slice(0, 8).map((log: any, idx: number) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="h-9 w-9 flex-none overflow-hidden rounded-full bg-slate-700 text-sm font-medium text-white flex items-center justify-center">{String(log.actor_id ?? log.user_id ?? "?").slice(-2)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-200">{log.action ?? log.details ?? "action"}</p>
              <p className="text-xs text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</p>
            </div>
            {log.details && <p className="mt-1 text-xs text-slate-400">{log.details}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
