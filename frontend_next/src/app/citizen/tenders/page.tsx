import { PageHeader } from "@/components/dashboard/page-header";
import { TenderTable } from "@/components/modules/tenders/tender-table";

export default function CitizenTendersPage() {
  return <div className="space-y-6"><PageHeader title="View Tenders" description="Public tender transparency view from /tenders." /><TenderTable /></div>;
}
