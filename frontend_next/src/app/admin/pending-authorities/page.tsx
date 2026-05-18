import { PageHeader } from "@/components/dashboard/page-header";
import { PendingUsersTable } from "@/components/modules/admin/admin-modules";

export default function PendingAuthoritiesPage() {
  return <div className="space-y-6"><PageHeader title="Pending Authorities" description="Approval queue from /pending-authorities." /><PendingUsersTable kind="authorities" /></div>;
}
