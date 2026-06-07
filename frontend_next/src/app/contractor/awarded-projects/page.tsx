"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { tenderService } from "@/services/tender.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AwardedProjectsPage() {
  const { session } = useAuth();
  const participationQuery = useApiQuery(
    () => (session ? tenderService.awardedProjects(session.user_id) : Promise.resolve([])),
    [session?.user_id],
  );

  const awarded = (participationQuery.data ?? []);

  // local state for updating progress per project id
  const [progressInput, setProgressInput] = useState<Record<number, number>>({});
  const [updateText, setUpdateText] = useState<Record<number, string>>({});

  async function submitUpdate(tenderId: number) {
    if (!session) return;
    const progress = progressInput[tenderId];
    const text = updateText[tenderId];
    if (progress == null) return toast.error("Enter progress percent");
    try {
      await tenderService.addProjectUpdate(tenderId, session.user_id, progress, text);
      toast.success("Progress updated");
      participationQuery.refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Could not save update");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Awarded Projects" description="Projects awarded to you." />
      <div className="space-y-3">
        {awarded.length === 0 && <div className="text-sm text-slate-400">No awarded projects yet.</div>}
        {awarded.map((p: any) => (
          <Card key={p.tender_id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400">Area: {p.area ?? "-"}</div>
              <div className="text-sm text-slate-400">Authority: {p.authority_name ?? "-"}</div>
              <div className="text-sm text-slate-400">Award Date: {p.award_date ?? "-"}</div>
              <div className="mt-2">
                <div className="text-sm">Awarded Bid: {p.awarded_bid_amount ?? "-"}</div>
                <div className="text-sm">Completion Days: {p.awarded_completion_days ?? "-"}</div>
                <div className="text-sm mt-2">Progress: {p.progress_percent ?? 0}%</div>
                <div className="w-full bg-slate-200 h-3 rounded mt-1"><div className="bg-green-500 h-3 rounded" style={{ width: `${p.progress_percent ?? 0}%`, transition: 'width 600ms' }} /></div>
                {
                  // Remaining days: calculate from award date and completion days when available
                }
                {p.award_date && p.awarded_completion_days ? (
                  (() => {
                    const awardDate = new Date(p.award_date);
                    const now = new Date();
                    const elapsedMs = now.getTime() - awardDate.getTime();
                    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
                    const remaining = Math.max(0, (p.awarded_completion_days ?? 0) - elapsedDays);
                    return <div className="text-sm text-slate-500">Remaining Days: {remaining}</div>;
                  })()
                ) : null}
                
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium">Project Updates</div>
                {p.updates && p.updates.length > 0 ? (
                  <ul className="list-disc pl-5 mt-2">
                    {p.updates.map((u: any) => (
                      <li key={u.id} className="text-sm">{u.progress_percent}% - {u.update_text ?? ""} <span className="text-xs text-slate-400">({u.created_at})</span></li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-400">No updates yet.</div>
                )}
              </div>

              <div className="mt-3 grid gap-2">
                <input type="number" min={0} max={100} placeholder="Progress % (0-100)" value={progressInput[p.tender_id] ?? ''} onChange={(e) => setProgressInput({ ...progressInput, [p.tender_id]: Number(e.target.value) })} className="h-10 rounded border px-2" />
                <textarea placeholder="Work update" value={updateText[p.tender_id] ?? ''} onChange={(e) => setUpdateText({ ...updateText, [p.tender_id]: e.target.value })} className="rounded border p-2" />
                <div className="flex justify-end"><Button onClick={() => submitUpdate(p.tender_id)}>Update Progress</Button></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
