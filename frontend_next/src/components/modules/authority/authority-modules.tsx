"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { useApiQuery } from "@/hooks/use-api-query";
import { getErrorMessage } from "@/lib/errors";
import { authorityService } from "@/services/authority.service";
import { useAuth } from "@/context/auth-context";

export function CaseQueueTable() {
  const { session } = useAuth();
  const q = useApiQuery(() => authorityService.unassignedRequests(), []);
  const officersQ = useApiQuery(() => authorityService.allOfficers(), []);
  const [selectedOfficerFor, setSelectedOfficerFor] = useState<Record<number, number | string>>({});
  const [filter, setFilter] = useState("");

  async function assign(police_request_id: number) {
    try {
      const officer_id = Number(selectedOfficerFor[police_request_id]);
      if (!officer_id || !session) {
        toast.error("Please select an officer");
        return;
      }
      await authorityService.assignCase({ police_request_id, officer_id, assigned_by_authority_id: session.user_id });
      toast.success("Officer assigned");
      q.refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not assign officer"));
    }
  }

  if (q.loading) return <Skeleton className="h-56" />;
  if (q.error) return <EmptyState title="Could not load unassigned cases" description={q.error} />;
  if (!q.data?.length) return <EmptyState title="No unassigned cases" description="Assignment queue is empty." />;

  return (
    <div>
      <div className="mb-3"><Input placeholder="Filter by category or type..." value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
      <TableWrap>
        <Table>
          <thead><tr><Th>ID</Th><Th>Category</Th><Th>Type</Th><Th>Status</Th><Th>Created</Th><Th>Assign</Th></tr></thead>
          <tbody>
            {(q.data ?? []).filter((r:any) => `${r.category} ${r.request_type}`.toLowerCase().includes(filter.toLowerCase())).map((r:any) => (
              <tr key={r.id}>
                <Td>{r.id}</Td>
                <Td>{r.category}</Td>
                <Td>{r.request_type}</Td>
                <Td><Badge>{r.status}</Badge></Td>
                <Td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</Td>
                <Td className="flex gap-2">
                  <select className="rounded-md border px-2 py-1 dark:bg-white/6" value={selectedOfficerFor[r.id] ?? ""} onChange={(e) => setSelectedOfficerFor({ ...selectedOfficerFor, [r.id]: e.target.value })}>
                    <option value="">Select officer</option>
                    {((officersQ.data ?? []).filter((o:any) => isOfficerCompatible(o, r))).map((o:any) => <option key={o.id} value={o.id}>{o.name} — {o.designation} — {o.area} {o.active_cases > 5 ? ` (Active ${o.active_cases})` : ''}</option>)}
                  </select>
                  <Button size="sm" onClick={() => assign(r.id)}>Assign</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}

function isOfficerCompatible(officer: any, request: any) {
  if (!officer || !request) return false;
  if ((officer.area || '').toLowerCase() !== (request.area || '').toLowerCase()) return false;
  const allowed = allowedDesignationsFor(request.category, request.request_type);
  const officerDesignation = (officer.designation || '').toLowerCase();
  return allowed.some((a:string) => a.toLowerCase() === officerDesignation);
}

function allowedDesignationsFor(category?: string, request_type?: string) {
  const cat = (category || '').toLowerCase();
  const rt = (request_type || '').toLowerCase();
  const low = ['Constable', 'ASI'];
  const medium = ['SI'];
  const high = ['Inspector', 'DB', 'CBI'];
  if (cat.includes('fraud') || cat.includes('cyber') || rt.includes('fraud') || rt.includes('cyber')) return [...medium, ...high];
  if (cat.includes('major') || cat.includes('homicide') || cat.includes('murder')) return high;
  if (cat.includes('snatch') || cat.includes('theft') || cat.includes('robbery')) return [...low, ...medium];
  return low;
}

export function InvestigationTable() {
  const { session } = useAuth();
  const q = useApiQuery(() => authorityService.assignedCasesAll(), []);
  const officersQ = useApiQuery(() => authorityService.allOfficers(), []);
  const [reassignFor, setReassignFor] = useState<Record<number, number | string>>({});

  async function reassign(police_request_id: number, assignment_id: number | string) {
    try {
      const officer_id = Number(reassignFor[assignment_id]);
      if (!officer_id || !session) {
        toast.error("Select an officer");
        return;
      }
      await authorityService.reassignCase({ police_request_id, officer_id, assigned_by_authority_id: session.user_id });
      toast.success("Reassigned");
      q.refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reassign"));
    }
  }

  // Authority cannot change investigation status directly; status updates are performed by officers.

  if (q.loading) return <Skeleton className="h-56" />;
  if (q.error) return <EmptyState title="Could not load assigned cases" description={q.error} />;
  if (!q.data?.length) return <EmptyState title="No active investigations" description="No assigned cases found." />;

  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>Case ID</Th><Th>Title</Th><Th>Officer</Th><Th>Designation</Th><Th>Status</Th><Th>Last Updated</Th></tr></thead>
        <tbody>
          {(q.data ?? []).map((r:any) => (
            <tr key={r.assignment_id ?? `${r.police_request_id}-${r.assigned_officer_id ?? 'na'}`}>
              <Td>{r.police_request_id}</Td>
              <Td>{r.category} / {r.request_type}</Td>
              <Td>{r.assigned_officer_name}</Td>
              <Td>{r.designation}</Td>
              <Td>{renderStatusBadge(r.status)}</Td>
              <Td>
                {r.last_update ? (
                  <span title={new Date(r.last_update).toISOString()}>{formatUpdateTimestamp(r.last_update)}</span>
                ) : (
                  <span>No updates</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}

function renderStatusBadge(raw: string) {
  if (!raw) return <Badge>Pending</Badge>;
  const s = String(raw).toLowerCase();
  if (s.includes('investig') || s.includes('investigating')) return <Badge>Under Investigation</Badge>;
  if (s.includes('suspect')) return <Badge>Suspect Identified</Badge>;
  if (s.includes('resolv') || s.includes('closed')) return <Badge>Resolved</Badge>;
  if (s.includes('pend')) return <Badge>Pending</Badge>;
  return <Badge>{raw}</Badge>;
}

function formatUpdateTimestamp(raw: string) {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    const now = Date.now();
    const diffSec = Math.floor((now - d.getTime()) / 1000);
    if (diffSec < 0) {
      // future timestamp, show formatted
      return formatDateShort(d);
    }
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return formatDateShort(d);
  } catch (e) {
    return String(raw ?? 'No updates');
  }
}

function formatDateShort(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  let hh = d.getHours();
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  const hhs = String(hh).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hhs}:${mins} ${ampm}`;
}
