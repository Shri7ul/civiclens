"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { TenderParticipationTable } from "@/components/modules/tenders/tender-table";

export default function MyApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Applications" description="View your tender submissions and their status." />
      <TenderParticipationTable />
    </div>
  );
}
