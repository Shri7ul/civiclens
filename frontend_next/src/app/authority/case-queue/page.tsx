import { PageHeader } from "@/components/dashboard/page-header";
import { CaseQueueTable } from "@/components/modules/authority/authority-modules";

export default function CaseQueuePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Case Queue" description="Unassigned police requests awaiting officer assignment." />
      <CaseQueueTable />
    </div>
  );
}
