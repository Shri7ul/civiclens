import { PageHeader } from "@/components/dashboard/page-header";
import { AssignedCasesTable } from "@/components/modules/cases/officer-case-modules";

export default function AssignedCasesPage() {
  return <div className="space-y-6"><PageHeader title="Assigned Cases" description="Live assigned case list from /assigned-cases/{officer_id}." /><AssignedCasesTable /></div>;
}
