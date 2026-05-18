"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { useApiQuery } from "@/hooks/use-api-query";
import { useAuth } from "@/context/auth-context";
import { authorityService } from "@/services/authority.service";
import { adminService } from "@/services/admin.service";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";

export default function AuthorityDashboard() {
  const { session } = useAuth();
  const unassignedQ = useApiQuery(() => authorityService.unassignedRequests(), []);
  const officersQ = useApiQuery(() => authorityService.allOfficers(), []);
  const statsQ = useApiQuery(() => adminService.systemStats(), []);

  const [selectedOfficerFor, setSelectedOfficerFor] = useState<Record<number, number | null>>({});
  const [filter, setFilter] = useState("");

  async function assign(police_request_id: number) {
    const officer_id = selectedOfficerFor[police_request_id];
    if (!officer_id || !session) return;
    await authorityService.assignCase({ police_request_id, officer_id, assigned_by_authority_id: session.user_id });
    unassignedQ.refetch();
    officersQ.refetch();
    statsQ.refetch();
  }

  async function reassign(police_request_id: number, newOfficerId: number) {
    if (!session) return;
    await authorityService.reassignCase({ police_request_id, officer_id: newOfficerId, assigned_by_authority_id: session.user_id });
    unassignedQ.refetch();
    officersQ.refetch();
    statsQ.refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Authority" title="Investigation Control Center" description="Manage unassigned police requests, assign officers, and monitor active investigations." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Unassigned Cases</CardTitle></CardHeader>
          <CardContent>{unassignedQ.loading ? "..." : (unassignedQ.data ?? []).length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Investigations</CardTitle></CardHeader>
          <CardContent>{statsQ.data?.total_active_investigations ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Assigned Officers</CardTitle></CardHeader>
          <CardContent>{(officersQ.data ?? []).length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resolved Cases</CardTitle></CardHeader>
          <CardContent>{(statsQ.data?.total_police_requests ?? 0) - (statsQ.data?.total_active_investigations ?? 0)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Card>
            <CardHeader><CardTitle>Unassigned Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by category or type..." className="w-full rounded-md border px-3 py-2 dark:bg-white/6" />
              </div>
              {unassignedQ.loading ? <div>Loading...</div> : (
                <TableWrap>
                  <Table>
                    <thead>
                      <tr><Th>ID</Th><Th>Category</Th><Th>Type</Th><Th>Status</Th><Th>Created</Th><Th>Assign</Th></tr>
                    </thead>
                    <tbody>
                      {(unassignedQ.data ?? []).filter((r:any) => `${r.category} ${r.request_type}`.toLowerCase().includes(filter.toLowerCase())).map((r:any) => (
                        <tr key={r.id}>
                          <Td>{r.id}</Td>
                          <Td>{r.category}</Td>
                          <Td>{r.request_type}</Td>
                          <Td>{r.status}</Td>
                          <Td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</Td>
                          <Td className="flex gap-2">
                            <select className="rounded-md border px-2 py-1 dark:bg-white/6" value={selectedOfficerFor[r.id] ?? ""} onChange={(e) => setSelectedOfficerFor({ ...selectedOfficerFor, [r.id]: Number(e.target.value) })}>
                              <option value="">Select officer</option>
                              {((officersQ.data ?? []).filter((o:any) => isOfficerCompatible(o, r))).map((o:any) => (
                                <option key={o.id} value={o.id}>{o.name} — {o.designation} — {o.area} {o.active_cases > 5 ? ` (Active ${o.active_cases})` : ''}</option>
                              ))}
                            </select>
                            <Button size="sm" onClick={() => assign(r.id)}>Assign Officer</Button>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Active Assignments</CardTitle></CardHeader>
            <CardContent>
              {/* Build a simple aggregated list by fetching assigned cases per officer */}
              {(officersQ.data ?? []).map((o:any) => (
                <div key={o.id} className="mb-4">
                  <div className="text-sm font-semibold">{o.name} — {o.designation} — {o.area}</div>
                  <div className="mt-1 text-sm">Active Cases: {o.active_cases ?? 0}</div>
                  <div className="text-sm text-slate-400">Resolved Cases: {o.resolved_cases ?? 0}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader><CardTitle>Recent Authority Activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityTimeline includeActions={["Assigned case", "Reassigned case", "Updated case", "Marked case"]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function isOfficerCompatible(officer: any, request: any) {
  // must match area
  if ((officer.area || '').toLowerCase() !== (request.area || '').toLowerCase()) return false;

  // determine allowed designations based on category or request_type
  const allowed = allowedDesignationsFor(request.category, request.request_type);
  const officerDesignation = (officer.designation || '').toLowerCase();
  return allowed.some((a:string) => a.toLowerCase() === officerDesignation);
}

function allowedDesignationsFor(category?: string, request_type?: string) {
  const cat = (category || '').toLowerCase();
  const rt = (request_type || '').toLowerCase();

  // default low severity
  const low = ['Constable', 'ASI'];
  const medium = ['SI'];
  const high = ['Inspector', 'DB', 'CBI'];

  // heuristics
  if (cat.includes('fraud') || cat.includes('cyber') || rt.includes('fraud') || rt.includes('cyber')) return [...medium, ...high];
  if (cat.includes('major') || cat.includes('homicide') || cat.includes('murder')) return high;
  if (cat.includes('snatch') || cat.includes('theft') || cat.includes('robbery')) return [...low, ...medium];

  return low;
}
