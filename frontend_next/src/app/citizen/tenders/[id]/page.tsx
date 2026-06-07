"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TenderDetailPage() {
  const routeParams = useParams();
  const id = Number(routeParams?.id);
  const { session } = useAuth();
  const tenderQ = useApiQuery(() => tenderService.get(id), [id]);
  const bidsQ = useApiQuery(() => tenderService.bids(id), [id]);
  const updatesQ = useApiQuery(() => tenderService.projectUpdates(id), [id]);
  const [file, setFile] = useState<File | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [completionDays, setCompletionDays] = useState(0);
  const [proposalText, setProposalText] = useState("");
  const router = useRouter();

  if (tenderQ.loading) return <div className="h-40" />;
  if (tenderQ.error) return <div>Could not load tender</div>;
  const tender = tenderQ.data;

  async function submitBid() {
    if (!session) return;
    const fd = new FormData();
    fd.append("contractor_user_id", String(session.user_id));
    fd.append("bid_amount", String(bidAmount));
    fd.append("completion_days", String(completionDays));
    fd.append("proposal_text", proposalText ?? "");
    if (file) fd.append("file", file);
    try {
      await tenderService.apply(id, fd);
      toast.success("Bid submitted");
      bidsQ.refetch();
      if (session.role === "contractor") router.push("/contractor/my-applications");
    } catch (err: any) {
      toast.error(err?.message || "Could not submit bid");
    }
  }

  async function doAward(bidId: number) {
    await tenderService.award(id, bidId);
    tenderQ.refetch();
    bidsQ.refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={tender.title} description={tender.area} />
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <div>{tender.description}</div>
          <div className="mt-2 text-sm text-slate-400">Budget: {tender.budget ?? "-"} • Deadline: {tender.deadline ?? "-"} • Status: {tender.status}</div>
        </CardContent>
      </Card>

      {session?.role === "contractor" && (
        <Card>
          <CardHeader><CardTitle>Apply to Tender</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <input type="number" placeholder="Bid amount" value={bidAmount || ""} onChange={(e) => setBidAmount(Number(e.target.value))} className="h-10 rounded border px-2" />
            <input type="number" placeholder="Estimated completion days" value={completionDays || ""} onChange={(e) => setCompletionDays(Number(e.target.value))} className="h-10 rounded border px-2" />
            <textarea placeholder="Proposal description" value={proposalText} onChange={(e) => setProposalText(e.target.value)} className="rounded border p-2" />
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            <div className="flex justify-end"><Button onClick={submitBid}>Submit Bid</Button></div>
          </CardContent>
        </Card>
      )}

      {session?.role === "authority" && (
        <Card>
          <CardHeader><CardTitle>Bids</CardTitle></CardHeader>
          <CardContent>
            {bidsQ.loading ? <div>Loading bids...</div> : (bidsQ.data ?? []).length === 0 ? <div>No bids yet</div> : (
              <table className="w-full text-sm">
                <thead><tr><th>Contractor</th><th>Company</th><th>Bid</th><th>Days</th><th>Submitted</th><th>Action</th></tr></thead>
                <tbody>
                  {(bidsQ.data ?? []).map((b:any) => (
                        <tr key={b.id} className="border-t">
                          <td>{b.contractor_name}</td>
                          <td>{b.company_name}</td>
                          <td>{b.bid_amount}</td>
                          <td>{b.completion_days}</td>
                          <td>{b.created_at ?? "-"}</td>
                          <td>
                            {b.proposal_document ? (
                              <a className="text-cyan-400 mr-2" href={`/${b.proposal_document}`} target="_blank" rel="noreferrer">View</a>
                            ) : null}
                            {b.proposal_document ? (
                              <a className="text-cyan-400 mr-2" href={`/${b.proposal_document}`} download>Download</a>
                            ) : null}
                            {tender.status !== 'awarded' && <Button onClick={() => doAward(b.id)}>Award</Button>}
                          </td>
                        </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {(tender.status && tender.status !== 'open') && (
        <Card>
          <CardHeader><CardTitle>Contractor Progress</CardTitle></CardHeader>
          <CardContent>
            {updatesQ.loading ? <div>Loading progress...</div> : (
              <div>
                <div className="text-sm">Project Status: {tender.status ?? '-'}</div>
                <div className="text-sm">Progress: {updatesQ.data && updatesQ.data.length > 0 ? `${updatesQ.data[0].progress_percent}%` : "0%"}</div>
                <div className="w-full bg-slate-200 h-3 rounded mt-1"><div className="bg-green-500 h-3 rounded" style={{ width: `${updatesQ.data && updatesQ.data.length > 0 ? updatesQ.data[0].progress_percent : 0}%`, transition: 'width 600ms' }} /></div>
                <div className="mt-3 text-sm font-medium">Latest Updates</div>
                {updatesQ.data && updatesQ.data.length > 0 ? (
                  <ul className="list-disc pl-5 mt-2">
                    {updatesQ.data.slice(0,5).map((u:any) => <li key={u.id} className="text-sm">{u.progress_percent}% - {u.update_text}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-400">Progress: 0%</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
