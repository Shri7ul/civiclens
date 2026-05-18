"use client";

import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { PageHeader } from "@/components/dashboard/page-header";
import { officerService } from "@/services/officer.service";
import { authorityService } from "@/services/authority.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { FileText, FolderKanban, BarChart3, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableWrap, Th, Td } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function OfficerDashboardPage() {
  const { session } = useAuth();
  const officerQ = useApiQuery(() => (session ? officerService.byUser(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  const officerId = officerQ.data?.officer_id;
  const assignedQ = useApiQuery(() => (officerId ? authorityService.assignedCases(officerId) : Promise.resolve([])), [officerId]);
  const officersQ = useApiQuery(() => authorityService.allOfficers(), []);

  const officerProfile = officersQ.data ? (officersQ.data as any).find((o:any) => o.id === officerId) : null;

  if (officerQ.loading || assignedQ.loading) return <Skeleton className="h-48" />;

  const assigned = assignedQ.data ?? [];
  const totalAssigned = assigned.length;
  const activeInvestigations = assigned.filter((a:any) => !["resolved","closed"].includes((a.status ?? "").toLowerCase())).length;
  const pendingReports = assigned.filter((a:any) => (a.status ?? "").toLowerCase() === "pending").length;
  const resolvedCases = assigned.filter((a:any) => ["resolved","closed"].includes((a.status ?? "").toLowerCase())).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Officer Dashboard" description="Operational view: assigned cases, workload, and recent investigation activity." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Assigned Cases" value={totalAssigned} icon={FileText} />
        <StatCard label="Active Investigations" value={activeInvestigations} icon={FolderKanban} />
        <StatCard label="Pending Reports" value={pendingReports} icon={BarChart3} />
        <StatCard label="Resolved Cases" value={resolvedCases} icon={Users} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader><CardTitle>Assigned Cases Preview</CardTitle></CardHeader>
            <CardContent>
              {assigned.length === 0 ? <div className="text-sm text-slate-400">No assigned cases</div> : (
                <TableWrap>
                  <Table>
                    <thead><tr><Th>ID</Th><Th>Citizen</Th><Th>Area</Th><Th>Status</Th><Th>Last Update</Th></tr></thead>
                    <tbody>
                            {assigned.slice(0, 8).map((a:any, idx:number) => (
                              <tr key={`${a.police_request_id ?? 'case'}-${idx}`}>
                                <Td>{a.police_request_id ?? a.id}</Td>
                                <Td>{a.citizen_name ?? a.user_name ?? '-'}</Td>
                                <Td>{a.area ?? officerProfile?.area ?? '-'}</Td>
                                <Td>{officerProfile?.designation ?? '-'}</Td>
                                <Td>{a.status ?? '-'}</Td>
                                <Td>{a.last_update ? new Date(a.last_update).toLocaleString() : (a.updated_at ? new Date(a.updated_at).toLocaleString() : (a.created_at ? new Date(a.created_at).toLocaleString() : '-'))}</Td>
                              </tr>
                            ))}
                    </tbody>
                  </Table>
                </TableWrap>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Workload</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-slate-300">Active: <strong>{activeInvestigations}</strong></div>
              <div className="text-sm text-slate-300">Resolved: <strong>{resolvedCases}</strong></div>
              <div className="text-sm text-slate-300">Assigned area: <strong>{officerProfile?.area ?? "-"}</strong></div>
              <div className="text-sm text-slate-300">Designation: <strong>{officerProfile?.designation ?? "-"}</strong></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
