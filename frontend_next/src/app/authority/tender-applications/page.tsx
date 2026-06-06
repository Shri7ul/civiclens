"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { Table, TableWrap, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TenderApplicationsList() {
  const q = useApiQuery(tenderService.list, []);
  if (q.loading) return <div className="h-40" />;
  if (q.error) return <div>Could not load tenders</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Tender Applications" description="All published tenders and their submitted bids." />
      <TableWrap>
        <Table>
          <thead><tr><Th>ID</Th><Th>Title</Th><Th>Area</Th><Th>Budget</Th><Th>Status</Th><Th>Action</Th></tr></thead>
          <tbody>
            {(q.data ?? []).map((t:any) => (
              <tr key={t.id}>
                <Td>{t.id}</Td>
                <Td>{t.title}</Td>
                <Td>{t.area}</Td>
                <Td>{t.budget}</Td>
                <Td>{t.status}</Td>
                <Td><Link href={`/authority/tenders/${t.id}`}><Button>Open</Button></Link></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
