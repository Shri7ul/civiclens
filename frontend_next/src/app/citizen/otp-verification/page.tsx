import { PageHeader } from "@/components/dashboard/page-header";
import { OtpVerificationForm } from "@/components/modules/verification/verification-panels";

export default function OtpVerificationPage() {
  return <div className="space-y-6"><PageHeader title="OTP Verification" description="Submit OTP to /verify-otp." /><OtpVerificationForm /></div>;
}
