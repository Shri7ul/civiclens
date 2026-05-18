import { PageHeader } from "@/components/dashboard/page-header";
import { NidVerificationForm } from "@/components/modules/verification/verification-panels";

export default function NidVerificationPage() {
  return <div className="space-y-6"><PageHeader title="NID Verification" description="Submit NID data to /verify-nid." /><NidVerificationForm /></div>;
}
