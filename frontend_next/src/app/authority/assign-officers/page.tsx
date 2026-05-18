import { AssignCaseForm } from "@/components/modules/authority/authority-modules";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AssignOfficersPage() {
  return <div className="space-y-6"><PageHeader title="Assign Officers" description="Assign police requests to officers using /assign-case." /><AssignCaseForm /></div>;
}
