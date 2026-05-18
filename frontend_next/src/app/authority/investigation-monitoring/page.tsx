import { PageHeader } from "@/components/dashboard/page-header";
import { PoliceRequestsTable } from "@/components/modules/authority/authority-modules";

export default function InvestigationMonitoringPage() {
  return <div className="space-y-6"><PageHeader title="Investigation Monitoring" description="Monitor request and investigation states from backend police request data." /><PoliceRequestsTable /></div>;
}
