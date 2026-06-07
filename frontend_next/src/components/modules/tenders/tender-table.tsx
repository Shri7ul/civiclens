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
  const { session } = useAuth();
  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load tenders" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No tenders published" description="Tender records from /tenders will appear here." />;
  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>ID</Th><Th>Title</Th><Th>Budget</Th><Th>Deadline</Th><Th>Status</Th><Th>Action</Th></tr></thead>
        <tbody>{query.data.map((item) => <tr key={item.id}><Td>{item.id}</Td><Td>{item.title}</Td><Td>{item.budget ?? "-"}</Td><Td>{item.deadline ?? "-"}</Td><Td><Badge>{item.status ?? "open"}</Badge></Td><Td><a className="text-cyan-400" href={`/${session?.role ?? 'citizen'}/tenders/${item.id}`}>View</a></Td></tr>)}</tbody>
      </Table>
    </TableWrap>
  );
}

export function TenderParticipationTable() {
  const { session } = useAuth();
  const query = useApiQuery(
    () => session ? tenderService.myBids(session.user_id) : Promise.resolve([]),
    [session?.user_id],
  );

  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load participation status" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No applications" description="Your submitted bids will appear here." />;

  return (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <Th>Tender Title</Th>
            <Th>Area</Th>
            <Th>Bid Amount</Th>
            <Th>Completion Days</Th>
            <Th>Status</Th>
            <Th>Submitted Date</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {query.data.map((item) => (
            <tr key={item.id}>
              <Td>{item.tender_title ?? "-"}</Td>
              <Td>{item.area ?? "-"}</Td>
              <Td>{item.bid_amount != null ? item.bid_amount : "-"}</Td>
              <Td>{item.completion_days ?? "-"}</Td>
              <Td><Badge>{item.status ?? "submitted"}</Badge></Td>
              <Td>{item.created_at ?? "-"}</Td>
              <Td><a className="text-cyan-400" href={`/contractor/my-applications/${item.id}`}>Open</a></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
