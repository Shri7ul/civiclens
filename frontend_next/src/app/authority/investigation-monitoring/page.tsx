import { PageHeader } from "@/components/dashboard/page-header";
import { InvestigationTable } from "@/components/modules/authority/authority-modules";

export default function InvestigationMonitoringPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Investigation Monitoring" description="Active assigned investigations and management actions." />
      <InvestigationTable />
    </div>
  );
}
