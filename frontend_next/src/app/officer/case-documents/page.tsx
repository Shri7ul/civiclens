import { PageHeader } from "@/components/dashboard/page-header";
import { CaseDocumentUploadForm } from "@/components/modules/cases/officer-case-modules";

export default function CaseDocumentsPage() {
  return <div className="space-y-6"><PageHeader title="Upload Case Documents" description="Upload evidence or investigation documents to /upload-case-document." /><CaseDocumentUploadForm /></div>;
}
