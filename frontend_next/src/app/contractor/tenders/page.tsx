import { PageHeader } from "@/components/dashboard/page-header";
import { TenderTable } from "@/components/modules/tenders/tender-table";

export default function ContractorTendersPage() {
  return <div className="space-y-6"><PageHeader title="View Tenders" description="Tender list from /tenders." /><TenderTable /></div>;
}
