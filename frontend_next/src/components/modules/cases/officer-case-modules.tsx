"use client";

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

export function AssignedCasesTable() {
  const { session } = useAuth();
  const query = useApiQuery(() => session ? caseService.assignedCases(session.user_id) : Promise.resolve([]), [session?.user_id]);
  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load assigned cases" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No assigned cases" description="Cases assigned by authority will appear here." />;
  return <TableWrap><Table><thead><tr><Th>ID</Th><Th>Title</Th><Th>Status</Th></tr></thead><tbody>{query.data.map((item) => <tr key={item.id}><Td>{item.id}</Td><Td>{item.title || item.description}</Td><Td><Badge>{item.status}</Badge></Td></tr>)}</tbody></Table></TableWrap>;
}

export function CaseUpdateForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{ police_request_id: number; update_text: string; status?: string }>();
  async function onSubmit(values: { police_request_id: number; update_text: string; status?: string }) {
    try {
      await caseService.addCaseUpdate(values);
      toast.success("Case update added");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add the case update."));
    }
  }

  return (
    <Card><CardHeader><CardTitle>Add Case Update</CardTitle></CardHeader><CardContent>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input type="number" placeholder="Police request ID" {...register("police_request_id", { valueAsNumber: true, required: true })} />
        <Input placeholder="Status" {...register("status")} />
        <Textarea placeholder="Update details" {...register("update_text", { required: true })} />
        {errors.update_text && <p className="text-sm text-rose-500">Update details are required.</p>}
        <Button className="justify-self-end" disabled={isSubmitting}>Save update</Button>
      </form>
    </CardContent></Card>
  );
}

export function CaseDocumentUploadForm() {
  const { session } = useAuth();
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
      // include officer id from session
      if (session) {
        formData.append("officer_id", String(session.user_id));
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
