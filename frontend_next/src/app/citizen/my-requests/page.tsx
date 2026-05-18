import { PageHeader } from "@/components/dashboard/page-header";
import { MyRequestsTable } from "@/components/modules/police/my-requests-table";

export default function MyRequestsPage() {
  return <div className="space-y-6"><PageHeader title="My Requests" description="Live data from /my-police-requests/{user_id}." /><MyRequestsTable /></div>;
}
