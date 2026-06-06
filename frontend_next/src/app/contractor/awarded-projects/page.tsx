"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AwardedProjectsPage() {
  const { session } = useAuth();
  const participationQuery = useApiQuery(
    () => (session ? tenderService.participationStatus(session.user_id) : Promise.resolve([])),
    [session?.user_id],
  );

  const awarded = (participationQuery.data ?? []).filter((p: any) => (p.status ?? "").toLowerCase() === "awarded");

  return (
    <div className="space-y-6">
      <PageHeader title="Awarded Projects" description="Projects awarded to you." />
      <div className="space-y-3">
        {awarded.length === 0 && <div className="text-sm text-slate-400">No awarded projects yet.</div>}
        {awarded.map((p: any) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.tender_title ?? p.tender_id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400">Area: {p.area ?? "-"}</div>
              <div className="text-sm text-slate-400">Authority: {p.authority ?? "-"}</div>
              <div className="text-sm text-slate-400">Award Date: {p.awarded_at ?? "-"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
