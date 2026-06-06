"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Upload and manage proposal and project documents." />
      <EmptyState title="No documents" description="You can upload proposal documents from a tender application." />
    </div>
  );
}
