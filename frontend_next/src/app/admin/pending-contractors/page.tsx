import { PageHeader } from "@/components/dashboard/page-header";
import { PendingUsersTable } from "@/components/modules/admin/admin-modules";

export default function PendingContractorsPage() {
  return <div className="space-y-6"><PageHeader title="Pending Contractors" description="Approval queue from /pending-contractors." /><PendingUsersTable kind="contractors" /></div>;
}
