"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";

export function TenderTable() {
  const query = useApiQuery(tenderService.list, []);
  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load tenders" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No tenders published" description="Tender records from /tenders will appear here." />;
  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>ID</Th><Th>Title</Th><Th>Budget</Th><Th>Deadline</Th><Th>Status</Th></tr></thead>
        <tbody>{query.data.map((item) => <tr key={item.id}><Td>{item.id}</Td><Td>{item.title}</Td><Td>{item.budget ?? "-"}</Td><Td>{item.deadline ?? "-"}</Td><Td><Badge>{item.status ?? "open"}</Badge></Td></tr>)}</tbody>
      </Table>
    </TableWrap>
  );
}

export function TenderParticipationTable() {
  const { session } = useAuth();
  const query = useApiQuery(
    () => session ? tenderService.participationStatus(session.user_id) : Promise.resolve([]),
    [session?.user_id],
  );

  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load participation status" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No participation records" description="Submitted tender participation records will appear here." />;

  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>ID</Th><Th>Tender</Th><Th>Status</Th><Th>Submitted</Th><Th>Remarks</Th></tr></thead>
        <tbody>
          {query.data.map((item) => (
            <tr key={item.id}>
              <Td>{item.id}</Td>
              <Td>{item.tender_title ?? item.tender_id ?? "-"}</Td>
              <Td><Badge>{item.status}</Badge></Td>
              <Td>{item.submitted_at ?? "-"}</Td>
              <Td>{item.remarks ?? "-"}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
