import { PageHeader } from "@/components/dashboard/page-header";
import { VerificationStatusPanel } from "@/components/modules/verification/verification-panels";

export default function VerificationStatusPage() {
  return <div className="space-y-6"><PageHeader title="Verification Status" description="Reads verification state from /verification-status/{user_id}." /><VerificationStatusPanel /></div>;
}
