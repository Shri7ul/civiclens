"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { VerificationCard } from "@/components/modules/citizen/verification-card";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { policeService } from "@/services/police.service";
import { authorityService } from "@/services/authority.service";
import { caseService } from "@/services/case.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FileText, FolderKanban, BarChart3, Users } from "lucide-react";
import { MyRequestsTable } from "@/components/modules/police/my-requests-table";

export default function CitizenDashboardPage() {
  const { session } = useAuth();
  const myRequestsQuery = useApiQuery(() => (session ? policeService.myPoliceRequests(session.user_id) : Promise.resolve([])), [session?.user_id]);
  const assignedQ = useApiQuery(() => authorityService.assignedCasesAll(), []);

  const myRequests = myRequestsQuery.data ?? [];

  const totalRequests = myRequests.length;
  const activeCases = myRequests.filter((r:any) => (r.status ?? "").toLowerCase() !== "closed" && (r.status ?? "").toLowerCase() !== "resolved" && (r.status ?? "").toLowerCase() !== "resolved").length;
  const underInvestigation = myRequests.filter((r:any) => (r.status ?? "").toLowerCase() === "investigating").length;
  const resolvedCases = myRequests.filter((r:any) => ["resolved","closed"].includes(((r.status ?? "") as string).toLowerCase())).length;

  // determine latest case update across user's cases by checking assignedQ last_update matching user's requests
  const assignMap = new Map<number, any>();
  (assignedQ.data ?? []).forEach((a:any) => assignMap.set(a.police_request_id, a));

  let latestCase: any = null;
  myRequests.forEach((r:any) => {
    const a = assignMap.get(r.id);
    const ts = a?.last_update ?? r.created_at;
    if (!latestCase || new Date(ts) > new Date(latestCase.ts)) {
      latestCase = { request: r, assign: a, ts };
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Citizen Dashboard" description="Track your police requests (GD), monitor investigation progress, and manage verification." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <VerificationCard />

          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Requests" value={totalRequests} icon={FileText} />
            <StatCard label="Active Cases" value={activeCases} icon={FolderKanban} />
            <StatCard label="Under Investigation" value={underInvestigation} icon={BarChart3} />
            <StatCard label="Resolved Cases" value={resolvedCases} icon={Users} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Latest Case Update</CardTitle>
            </CardHeader>
            <CardContent>
              {latestCase ? (
                <div className="text-sm text-slate-300">
                  <div className="font-semibold">GD #{latestCase.request.id} · {latestCase.request.category ?? latestCase.request.request_type}</div>
                  <div className="mt-2">Status: <strong>{latestCase.request.status}</strong></div>
                  <div>Assigned officer: <strong>{latestCase.assign?.assigned_officer_name ?? "Unassigned"}</strong> {latestCase.assign?.designation ? `· ${latestCase.assign.designation}` : ""}</div>
                  <div className="mt-2">Last updated: {latestCase.ts ? new Date(latestCase.ts).toLocaleString() : "-"}</div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">No recent updates.</div>
              )}
            </CardContent>
          </Card>

          
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Evidence Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-300">Files uploaded to your requests will appear here. Open a request to view evidence and download files.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <MyRequestsTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
