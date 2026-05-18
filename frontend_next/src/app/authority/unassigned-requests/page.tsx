import { PageHeader } from "@/components/dashboard/page-header";
import { PoliceRequestsTable } from "@/components/modules/authority/authority-modules";

export default function UnassignedRequestsPage() {
  return <div className="space-y-6"><PageHeader title="View Unassigned Requests" description="Review police requests from /police-requests before assignment." /><PoliceRequestsTable /></div>;
}
