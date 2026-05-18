"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { policeService } from "@/services/police.service";

export function MyRequestsTable() {
  const { session } = useAuth();
  const query = useApiQuery(() => session ? policeService.myPoliceRequests(session.user_id) : Promise.resolve([]), [session?.user_id]);

  if (query.loading) return <Skeleton className="h-56" />;
  if (query.error) return <EmptyState title="Could not load requests" description={query.error} />;
  if (!query.data?.length) return <EmptyState title="No police requests yet" description="Submitted police requests and GD entries will appear here." />;

  return (
    <TableWrap>
      <Table>
        <thead><tr><Th>ID</Th><Th>Title</Th><Th>Status</Th><Th>Created</Th></tr></thead>
        <tbody>
          {query.data.map((item) => <tr key={item.id}><Td>{item.id}</Td><Td>{item.title || item.description}</Td><Td><Badge>{item.status}</Badge></Td><Td>{item.created_at || "-"}</Td></tr>)}
        </tbody>
      </Table>
    </TableWrap>
  );
}
