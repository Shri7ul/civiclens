import { PageHeader } from "@/components/dashboard/page-header";
import { TenderParticipationTable } from "@/components/modules/tenders/tender-table";

export default function ParticipationStatusPage() {
  return <div className="space-y-6"><PageHeader title="Tender Participation Status" description="Track contractor tender submissions and review outcomes." /><TenderParticipationTable /></div>;
}
