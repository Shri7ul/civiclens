"use client";

import { useForm } from "react-hook-form";
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
import { caseService } from "@/services/case.service";
import { policeService } from "@/services/police.service";

export function AssignCaseForm() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ police_request_id: number; officer_id: number }>();
  async function onSubmit(values: { police_request_id: number; officer_id: number }) {
    try {
      await caseService.assignCase(values);
      toast.success("Case assigned");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not assign the case."));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Assign Case to Officer</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit(onSubmit)}>
          <Input type="number" placeholder="Police request ID" {...register("police_request_id", { valueAsNumber: true, required: true })} />
          <Input type="number" placeholder="Officer ID" {...register("officer_id", { valueAsNumber: true, required: true })} />
          <Button disabled={isSubmitting}>{isSubmitting ? "Assigning..." : "Assign"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PoliceRequestsTable() {
  const query = useApiQuery(policeService.allPoliceRequests, []);
  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load police requests" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No police requests" description="Requests from /police-requests will appear here." />;
  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>ID</Th><Th>Title</Th><Th>Citizen</Th><Th>Officer</Th><Th>Status</Th></tr></thead>
        <tbody>
          {query.data.map((item) => (
            <tr key={item.id}>
              <Td>{item.id}</Td>
              <Td>{item.title || item.description}</Td>
              <Td>{item.citizen_id ?? "-"}</Td>
              <Td>{item.assigned_officer_id ?? "Unassigned"}</Td>
              <Td><Badge>{item.status}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
