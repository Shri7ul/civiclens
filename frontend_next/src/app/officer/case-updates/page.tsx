import { PageHeader } from "@/components/dashboard/page-header";
import { CaseUpdateForm } from "@/components/modules/cases/officer-case-modules";

export default function CaseUpdatesPage() {
  return <div className="space-y-6"><PageHeader title="Add Case Updates" description="Post investigation updates to /add-case-update." /><CaseUpdateForm /></div>;
}
