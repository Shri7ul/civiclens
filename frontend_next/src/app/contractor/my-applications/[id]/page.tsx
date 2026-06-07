"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyApplicationDetail({ params }: { params?: { id?: string } }) {
  const routeParams = useParams();
  // `params` may be a Promise in this Next version; unwrap safely with React.use()
  const resolvedParams: any = React.use(params);
  const paramId = resolvedParams?.id ?? routeParams?.id;
  const id = Number(paramId);
  const { session } = useAuth();
  const myBidQ = useApiQuery(() => session ? tenderService.myBid(id, session.user_id) : Promise.resolve(null), [id, session?.user_id]);

  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [completionDays, setCompletionDays] = useState<number | null>(null);
  const [proposalText, setProposalText] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  if (myBidQ.loading) return <div className="h-40" />;
  if (myBidQ.error) return <div>Could not load application</div>;
  if (!myBidQ.data) return <div>No application found</div>;

  const data = myBidQ.data;
  const tender = data.tender ?? {};
  const bid = data.bid ?? {};

  const status = (tender.status || bid.status || "").toLowerCase();
  const readOnly = ["awarded", "closed", "completed"].includes(status);

  async function saveChanges() {
    if (!session) return;
    const fd = new FormData();
    fd.append("contractor_user_id", String(session.user_id));
    if (bidAmount !== null) fd.append("bid_amount", String(bidAmount));
    if (completionDays !== null) fd.append("completion_days", String(completionDays));
    if (proposalText !== null) fd.append("proposal_text", proposalText);
    if (file) fd.append("file", file);
    try {
      await tenderService.updateBid(id, fd);
      toast.success("Bid updated");
      myBidQ.refetch();
    } catch (err: any) {
      toast.error(err?.message || "Could not update bid");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Application #${data.id}`} description={tender.title} />

      <Card>
        <CardHeader><CardTitle>Tender Information</CardTitle></CardHeader>
        <CardContent>
          <div className="text-lg font-medium">{tender.title}</div>
          <div className="text-sm text-slate-500">{tender.area}</div>
          <div className="mt-2 text-sm text-slate-400">Budget: {tender.budget ?? "-"} • Status: {tender.status ?? "open"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Submitted Bid</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <input type="number" placeholder="Bid amount" value={bidAmount ?? bid.bid_amount ?? ""} onChange={(e) => setBidAmount(Number(e.target.value))} className="h-10 rounded border px-2" disabled={readOnly} />
          <input type="number" placeholder="Completion days" value={completionDays ?? bid.completion_days ?? ""} onChange={(e) => setCompletionDays(Number(e.target.value))} className="h-10 rounded border px-2" disabled={readOnly} />
          <textarea placeholder="Proposal description" value={proposalText ?? bid.proposal_text ?? ""} onChange={(e) => setProposalText(e.target.value)} className="rounded border p-2" disabled={readOnly} />
          <div>
            {bid.proposal_document ? (
              <a className="text-cyan-400 mr-4" href={`/${bid.proposal_document}`} target="_blank" rel="noreferrer">View proposal</a>
            ) : null}
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} disabled={readOnly} />
          </div>

          {readOnly ? (
            <div className="text-sm text-rose-600">This tender is no longer accepting bid modifications.</div>
          ) : (
            <div className="flex justify-end"><Button onClick={saveChanges}>Save Changes</Button></div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-slate-500">Submitted: {bid.created_at ?? "-"}</div>
    </div>
  );
}
