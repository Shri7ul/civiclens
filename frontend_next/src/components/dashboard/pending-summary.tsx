"use client";

import { adminService } from "@/services/admin.service";
import { useApiQuery } from "@/hooks/use-api-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function PendingSummary() {
  const officersQ = useApiQuery(adminService.pendingOfficers, ["officers"]);
  const authQ = useApiQuery(adminService.pendingAuthorities, ["authorities"]);
  const contQ = useApiQuery(adminService.pendingContractors, ["contractors"]);

  if (officersQ.loading || authQ.loading || contQ.loading) return <Skeleton className="h-28" />;
  if (officersQ.error || authQ.error || contQ.error) return <EmptyState title="Could not load pending summary" description="Try again later." />;

  const total = (officersQ.data?.length ?? 0) + (authQ.data?.length ?? 0) + (contQ.data?.length ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Total pending</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          <div>Officers: {officersQ.data?.length ?? 0}</div>
          <div>Authorities: {authQ.data?.length ?? 0}</div>
          <div>Contractors: {contQ.data?.length ?? 0}</div>
        </div>
      </CardContent>
    </Card>
  );
}
