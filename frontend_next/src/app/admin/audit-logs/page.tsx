import { PageHeader } from "@/components/dashboard/page-header";
import { AuditLogsTable } from "@/components/modules/admin/admin-modules";

export default function AuditLogsPage() {
  return <div className="space-y-6"><PageHeader title="Audit Logs" description="Administrative audit stream from /audit-logs." /><AuditLogsTable /></div>;
}
