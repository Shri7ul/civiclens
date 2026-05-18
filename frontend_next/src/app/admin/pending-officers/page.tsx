import { PageHeader } from "@/components/dashboard/page-header";
import { PendingUsersTable } from "@/components/modules/admin/admin-modules";

export default function PendingOfficersPage() {
  return <div className="space-y-6"><PageHeader title="Pending Officers" description="Approval queue from /pending-officers." /><PendingUsersTable kind="officers" /></div>;
}
