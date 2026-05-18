import { PageHeader } from "@/components/dashboard/page-header";
import { PendingUsersTable } from "@/components/modules/admin/admin-modules";

export default function UserApprovalsPage() {
  return <div className="space-y-6"><PageHeader title="Approve / Reject Users" description="Use approve-user and reject-user endpoints for pending role accounts." /><PendingUsersTable kind="officers" /><PendingUsersTable kind="authorities" /><PendingUsersTable kind="contractors" /></div>;
}
