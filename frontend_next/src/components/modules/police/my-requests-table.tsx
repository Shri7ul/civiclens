"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { policeService } from "@/services/police.service";
import { authorityService } from "@/services/authority.service";
import { caseService } from "@/services/case.service";
import { useState } from "react";

function formatDate(ts?: string | null) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function MyRequestsTable() {
  const { session } = useAuth();
  const q = useApiQuery(() => (session ? policeService.myPoliceRequests(session.user_id) : Promise.resolve([])), [session?.user_id]);
  const assignedQ = useApiQuery(() => authorityService.assignedCasesAll(), []);
  const verificationQ = useApiQuery(() => (session ? (awaitableVerification(session.user_id)) : Promise.resolve({ verified: false, nid_verified: false, verification_completed: false })), [session?.user_id]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const updatesQuery = useApiQuery(() => (expandedId ? caseService.caseUpdates(expandedId) : Promise.resolve([])), [expandedId]);
  const docsQuery = useApiQuery(() => (expandedId ? caseService.caseDocuments(expandedId) : Promise.resolve([])), [expandedId]);

  if (q.loading || assignedQ.loading) return <Skeleton className="h-56" />;
  if (q.error) return <EmptyState title="Could not load requests" description={q.error} />;
  if (!q.data?.length) return <EmptyState title="No police requests yet" description="Submitted police requests and GD entries will appear here." />;

  // build assignment map
  const assignMap = new Map<number, any>();
  (assignedQ.data ?? []).forEach((a: any) => assignMap.set(a.police_request_id, a));

  // helper to fetch verification safely
  async function awaitableVerification(userId: number) {
    const vs = await (await import("@/services/verification.service")).verificationService.getStatus(userId);
    return vs;
  }

  return (
    <div className="grid gap-4">
      {(q.data ?? []).map((item: any) => {
        const assign = assignMap.get(item.id);
        const evidenceCount = docsQuery.data ? (docsQuery.data.filter((d:any) => d.police_request_id === item.id).length) : undefined;

        return (
          <Card key={item.id}>
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-400">GD #{item.id}</div>
                  <div className="text-base font-semibold">{item.category ?? item.title ?? (item.description?.slice(0,60) ?? "Untitled")}</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  <span className="mr-3">Type: {item.request_type ?? "-"}</span>
                  <span className="mr-3">Area: {item.area ?? "-"}</span>
                  <span>Created: {formatDate(item.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge>{item.status}</Badge>
                <div className="text-sm text-slate-400">Last update: {assign?.last_update ? formatDate(assign.last_update) : formatDate(item.created_at)}</div>
                <div className="text-sm text-slate-400">Assigned: {assign?.assigned_officer_name ?? "Unassigned"} {assign?.designation ? `· ${assign.designation}` : ""}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="text-sm text-slate-300">{item.description}</div>
                <div className="text-sm text-slate-300">
                  <div>Evidence: {evidenceCount ?? "—"}</div>
                  <div>Verification: {verificationQ.data?.verification_completed ? "Completed" : verificationQ.data ? (verificationQ.data.verified ? "OTP verified" : "OTP pending") : "—"}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>{expandedId === item.id ? "Hide details" : "View details"}</Button>
                </div>
                <div className="text-sm text-slate-400">Priority: {item.priority ?? "Normal"}</div>
              </div>

              {expandedId === item.id && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-semibold">Investigation Timeline</h4>
                    {updatesQuery.loading ? <div>Loading timeline...</div> : updatesQuery.data && updatesQuery.data.length ? (
                      <ol className="mt-2 space-y-2">
                        {updatesQuery.data.map((u:any) => (
                          <li key={u.id} className="text-sm text-slate-300">{formatDate(u.created_at)} — {u.update_text} {u.status ? `· ${u.status}` : ""}</li>
                        ))}
                      </ol>
                    ) : <div className="text-sm text-slate-400">No timeline updates yet.</div>}
                  </div>

                  <div>
                    <h4 className="font-semibold">Uploaded Evidence</h4>
                    {docsQuery.loading ? <div>Loading evidence...</div> : docsQuery.data && docsQuery.data.length ? (
                      <ul className="mt-2 space-y-2">
                        {docsQuery.data.map((d:any) => (
                          <li key={d.id} className="text-sm text-slate-300 flex items-center justify-between">
                            <span>{d.file_name}</span>
                            <a className="text-cyan-400" href={`/${d.file_path}`} target="_blank" rel="noreferrer">View</a>
                          </li>
                        ))}
                      </ul>
                    ) : <div className="text-sm text-slate-400">No uploaded evidence.</div>}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
