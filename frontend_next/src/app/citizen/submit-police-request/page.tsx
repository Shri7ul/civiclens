import { PageHeader } from "@/components/dashboard/page-header";
import { PoliceRequestForm } from "@/components/modules/police/police-request-form";

export default function SubmitPoliceRequestPage() {
  return <div className="space-y-6"><PageHeader title="Submit Police Request / GD" description="Send a police complaint or general diary request directly to the FastAPI backend." /><PoliceRequestForm /></div>;
}
