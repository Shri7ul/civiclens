"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { getErrorMessage } from "@/lib/errors";
import { caseService } from "@/services/case.service";
import { officerService } from "@/services/officer.service";
import { policeService } from "@/services/police.service";

export function AssignedCasesTable() {
  const { session } = useAuth();
  // map logged-in user_id -> officer id first
  const officerQ = useApiQuery(() => (session ? officerService.byUser(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  const officerId = officerQ.data?.officer_id;
  const query = useApiQuery(() => (officerId ? caseService.assignedCases(officerId) : Promise.resolve([])), [officerId]);
  // keep hooks stable across renders: declare stateful hooks before any early returns
  const [selectedCaseId, setSelectedCaseId] = React.useState<number | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  if (query.loading) return <Skeleton className="h-56" />;
  if (officerQ.error) return <EmptyState title="Officer lookup failed" description={officerQ.error} />;
  if (query.error) return <EmptyState title="Could not load assigned cases" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No assigned cases" description="Cases assigned by authority will appear here." />;

  function openDetails(id: number) {
    setSelectedCaseId(id);
    setShowDetails(true);
  }

  return (
    <>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Case ID</Th>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Request Type</Th>
              <Th>Area</Th>
              <Th>Priority</Th>
              <Th>Designation</Th>
              <Th>Status</Th>
              <Th>Last Update</Th>
              <Th>Evidence</Th>
              <Th>Citizen Evidence</Th>
              <Th>Officer Evidence</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {query.data.map((item: any, idx: number) => (
              <tr key={`${item.police_request_id ?? item.id ?? 'case'}-${idx}`}>
                <Td>{item.police_request_id ?? item.id}</Td>
                <Td>{item.title ?? item.description ?? '-'}</Td>
                <Td>{item.category ?? item.case_category ?? '-'}</Td>
                <Td>{item.request_type ?? item.type ?? '-'}</Td>
                <Td>{item.area ?? '-'}</Td>
                <Td>{item.priority ?? '-'}</Td>
                <Td>{item.designation ?? item.officer_designation ?? '-'}</Td>
                <Td><Badge>{item.status ?? '-'}</Badge></Td>
                <Td>{item.last_update ? new Date(item.last_update).toLocaleString() : '-'}</Td>
                <Td>{item.evidence_count ?? item.total_documents ?? '-'}</Td>
                <Td>{item.citizen_evidence_count ?? item.citizen_documents ?? '-'}</Td>
                <Td>{item.officer_evidence_count ?? item.officer_documents ?? '-'}</Td>
                <Td><Button size="sm" onClick={() => openDetails(item.police_request_id ?? item.id)}>View Details</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      {showDetails && selectedCaseId && (
        <CaseDetailsModal policeRequestId={selectedCaseId} onClose={() => setShowDetails(false)} onSaved={() => query.refetch()} officerId={officerId ?? null} />
      )}
    </>
  );
}

export function CaseUpdateForm() {
  const { session } = useAuth();
  const officerQ = useApiQuery(() => (session ? officerService.byUser(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  const officerId = officerQ.data?.officer_id ?? null;
  // load assigned cases for dropdown
  const assignedQ = useApiQuery(() => (officerId ? caseService.assignedCases(officerId) : Promise.resolve([])), [officerId]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{ police_request_id: number; update_message: string; case_status?: string; file?: FileList }>();
  async function onSubmit(values: { police_request_id: number; update_message: string; case_status?: string; file?: FileList }) {
    if (!officerId) {
      toast.error("Officer lookup failed");
      return;
    }

    try {
      await caseService.addCaseUpdate({ police_request_id: values.police_request_id, officer_id: officerId, update_message: values.update_message, case_status: values.case_status ?? "investigating" });

      // optional file upload
      const file = values.file?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("police_request_id", String(values.police_request_id));
        formData.append("officer_id", String(officerId));
        formData.append("file", file);
        await caseService.uploadCaseDocument(formData);
      }

      toast.success("Case update submitted");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add the case update."));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add Case Update</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-sm">Select Assigned Case</label>
          <select {...register("police_request_id", { valueAsNumber: true, required: true })} className="w-full p-2 border rounded">
            <option value="">-- select case --</option>
            {(assignedQ.data ?? []).map((c: any) => (
              <option key={c.police_request_id ?? c.id} value={c.police_request_id ?? c.id}>{`#${c.police_request_id ?? c.id} — ${c.title ?? c.description ?? ''}`}</option>
            ))}
          </select>

          <Input placeholder="Status (investigating, resolved, closed)" {...register("case_status")} />
          <Textarea placeholder="Update details" {...register("update_message", { required: true })} />

          <div>
            <label className="text-sm">Optional Evidence</label>
            <Input type="file" {...register("file")} />
          </div>

          {errors.update_message && <p className="text-sm text-rose-500">Update details are required.</p>}
          <Button className="justify-self-end" disabled={isSubmitting}>Save update</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function CaseDocumentUploadForm() {
  const { session } = useAuth();
  const officerQ = useApiQuery(() => (session ? officerService.byUser(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  const officerId = officerQ.data?.officer_id ?? null;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{ police_request_id: number; file: FileList }>();
  async function onSubmit(values: { police_request_id: number; file: FileList }) {
    const file = values.file?.[0];
    if (!file) {
      toast.error("Choose a document before uploading.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("police_request_id", String(values.police_request_id));
      // include officer id from officer mapping
      if (officerId) {
        formData.append("officer_id", String(officerId));
      }
      formData.append("file", file);
      await caseService.uploadCaseDocument(formData);
      toast.success("Document uploaded");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not upload the document."));
    }
  }

  return (
    <Card><CardHeader><CardTitle>Upload Case Document</CardTitle></CardHeader><CardContent>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input type="number" placeholder="Police request ID" {...register("police_request_id", { valueAsNumber: true, required: true })} />
        {errors.police_request_id && <p className="text-sm text-rose-500">Police request ID is required.</p>}
        <Input type="file" {...register("file", { required: true })} />
        {errors.file && <p className="text-sm text-rose-500">Select a file to upload.</p>}
        <Button className="justify-self-end" disabled={isSubmitting}>Upload document</Button>
      </form>
    </CardContent></Card>
  );
}

function CaseDetailsModal({ policeRequestId, onClose, onSaved, officerId }: { policeRequestId: number; onClose: () => void; onSaved?: () => void; officerId?: number | null }) {
  const updatesQ = useApiQuery(() => caseService.caseUpdates(policeRequestId), [policeRequestId]);
  const docsQ = useApiQuery(() => caseService.caseDocuments(policeRequestId), [policeRequestId]);
  const infoQ = useApiQuery(() => (policeService.allPoliceRequests().then((res:any) => res.find((r:any) => r.id === policeRequestId)) as any), [policeRequestId]);

  const citizenDocs = (docsQ.data ?? []).filter((d: any) => !d.officer_id);
  const officerDocs = (docsQ.data ?? []).filter((d: any) => d.officer_id);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 modal-backdrop">
      <div className="w-full max-w-4xl modal-card overflow-auto max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Case Details — #{policeRequestId}</h3>
          <div className="space-x-2">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <section>
            <h4 className="font-medium">Case Information</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>Case ID: <strong>{policeRequestId}</strong></div>
              <div>Category: <strong>{infoQ.data?.category ?? '-'}</strong></div>
              <div>Request Type: <strong>{infoQ.data?.request_type ?? '-'}</strong></div>
              <div>Area: <strong>{infoQ.data?.area ?? '-'}</strong></div>
              <div>Submitted: <strong>{infoQ.data?.created_at ? new Date(infoQ.data.created_at).toLocaleString() : '-'}</strong></div>
              <div>Description: <div className="mt-1 text-sm text-slate-700">{infoQ.data?.description ?? '-'}</div></div>
            </div>
          </section>

          <section>
            <h4 className="font-medium">Investigation Timeline</h4>
            <div className="mt-2 space-y-2">
              {updatesQ.loading ? <div className="text-sm text-slate-400">Loading...</div> : (updatesQ.data ?? []).length === 0 ? <div className="text-sm text-slate-400">No updates yet.</div> : (
                <ul className="space-y-2">
                  {(updatesQ.data ?? []).map((u: any) => (
                    <li key={u.id} className="p-2 border rounded">
                      <div className="text-sm text-slate-600">{u.update_message ?? u.update_text}</div>
                      <div className="text-xs text-slate-400 mt-1">Status: <strong>{u.case_status ?? u.status}</strong> • {u.updated_at ? new Date(u.updated_at).toLocaleString() : u.created_at ? new Date(u.created_at).toLocaleString() : ''}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h4 className="font-medium">Citizen Uploaded Evidence</h4>
            <div className="mt-2 space-y-2">
              {docsQ.loading ? <div className="text-sm text-slate-400">Loading...</div> : citizenDocs.length === 0 ? <div className="text-sm text-slate-400">No citizen evidence.</div> : (
                <ul className="space-y-2">
                  {citizenDocs.map((d: any) => (
                    <li key={d.id} className="p-2 border rounded flex justify-between items-center">
                      <div>
                        <div className="text-sm">{d.file_name}</div>
                        <div className="text-xs text-slate-400">{d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : '-'}</div>
                      </div>
                      <a className="text-sm text-blue-600" href={`/${d.file_path}`} target="_blank" rel="noreferrer">Preview / Download</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h4 className="font-medium">Officer Uploaded Evidence</h4>
            <div className="mt-2 space-y-2">
              {docsQ.loading ? <div className="text-sm text-slate-400">Loading...</div> : officerDocs.length === 0 ? <div className="text-sm text-slate-400">No officer evidence.</div> : (
                <ul className="space-y-2">
                  {officerDocs.map((d: any) => (
                    <li key={d.id} className="p-2 border rounded flex justify-between items-center">
                      <div>
                        <div className="text-sm">{d.file_name}</div>
                        <div className="text-xs text-slate-400">{d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : '-'}</div>
                      </div>
                      <a className="text-sm text-blue-600" href={`/${d.file_path}`} target="_blank" rel="noreferrer">Preview / Download</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="pt-4">
            <CaseUpdateForm />
          </div>
        </div>
      </div>
    </div>
  );
}
