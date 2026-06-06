"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AuthorityAwardedProjects() {
  const q = useApiQuery(tenderService.list, []);
  if (q.loading) return <div className="h-40" />;
  const awarded = (q.data ?? []).filter((t:any) => (t.status ?? "").toLowerCase() === "awarded");

  return (
    <div className="space-y-6">
      <PageHeader title="Awarded Projects" description="Projects awarded across tenders." />
      <div className="space-y-3">
        {awarded.length === 0 && <div className="text-sm text-slate-400">No awarded tenders yet.</div>}
        {awarded.map((t:any) => (
          <Card key={t.id}>
            <CardHeader><CardTitle>{t.title}</CardTitle></CardHeader>
            <CardContent>
              <div>Area: {t.area}</div>
              <div>Status: {t.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
