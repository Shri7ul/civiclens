"use client";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { TenderTable, TenderParticipationTable } from "@/components/modules/tenders/tender-table";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function RecentTenders() {
  const query = useApiQuery(tenderService.list, []);
  if (query.loading) return <div className="h-40" />;
  const items = query.data ?? [];
  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((t: any) => (
        <Card key={t.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.title}</span>
              <span className="text-xs text-slate-500">{t.status ?? "open"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              <div>Area: {t.area ?? "-"}</div>
              <div>Budget: {t.budget ?? "-"}</div>
              <div>Deadline: {t.deadline ?? "-"}</div>
            </div>
            <div>
              <Link href={`/contractor/tenders`}>
                <Button>Apply</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ContractorDashboardPage() {
  const { session } = useAuth();
  const participationQuery = useApiQuery(
    () => (session ? tenderService.participationStatus(session.user_id) : Promise.resolve([])),
    [session?.user_id],
  );

  const tendersQuery = useApiQuery(tenderService.list, []);

  const totalAvailable = (tendersQuery.data ?? []).length;
  const totalApplications = (participationQuery.data ?? []).length;
  const totalAwarded = (participationQuery.data ?? []).filter((p: any) => (p.status ?? "").toLowerCase() === "awarded").length;
  const totalCompleted = (participationQuery.data ?? []).filter((p: any) => (p.status ?? "").toLowerCase() === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Contractor" title="Dashboard" description="Procurement portal — view tenders, manage applications, and track awarded projects." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Card>
            <CardHeader><CardTitle>Available Tenders</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{totalAvailable}</CardContent>
          </Card>
        </div>
        <div className="space-y-2">
          <Card>
            <CardHeader><CardTitle>My Applications</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{totalApplications}</CardContent>
          </Card>
        </div>
        <div className="space-y-2">
          <Card>
            <CardHeader><CardTitle>Awarded Projects</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{totalAwarded}</CardContent>
          </Card>
        </div>
        <div className="space-y-2">
          <Card>
            <CardHeader><CardTitle>Completed Projects</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{totalCompleted}</CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Recent Tender Opportunities</CardTitle></CardHeader>
            <CardContent>
              <RecentTenders />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>My Tender Applications</CardTitle></CardHeader>
            <CardContent>
              <TenderParticipationTable />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Awarded Projects</CardTitle></CardHeader>
            <CardContent>
              {/* Reuse participation table but filter awarded */}
              {(participationQuery.loading) ? <div className="h-40" /> : (
                <div className="space-y-3">
                  {(participationQuery.data ?? []).filter((p: any) => (p.status ?? "").toLowerCase() === "awarded").map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.tender_title ?? p.tender_id}</div>
                        <div className="text-sm text-slate-400">Area: {p.area ?? "-"} • Authority: {p.authority ?? "-"}</div>
                      </div>
                      <div className="text-sm text-slate-500">Award Date: {p.awarded_at ?? "-"}</div>
                    </div>
                  ))}
                  {((participationQuery.data ?? []).filter((p: any) => (p.status ?? "").toLowerCase() === "awarded").length === 0) && (
                    <div className="text-sm text-slate-400">No awarded projects yet.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {(participationQuery.loading && tendersQuery.loading) ? <div className="h-48" /> : (
                <div className="space-y-2 text-sm text-slate-400">
                  {(participationQuery.data ?? []).slice(0, 6).map((p: any) => (
                    <div key={`act-${p.id}`}>
                      {`Applied for ${p.tender_title ?? `Tender #${p.tender_id}`} — ${p.submitted_at ?? "-"}`}
                    </div>
                  ))}
                  {(participationQuery.data ?? []).filter((p: any) => (p.status ?? "").toLowerCase() === "awarded").slice(0, 6).map((p: any) => (
                    <div key={`act-award-${p.id}`}>{`Awarded project ${p.tender_title ?? p.tender_id} — ${p.awarded_at ?? "-"}`}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
