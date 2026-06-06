"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { tenderService } from "@/services/tender.service";

export default function CreateTenderPage() {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("open");
  const router = useRouter();

  async function submit() {
    await tenderService.add({ title, area, budget: Number(budget) || 0, deadline, status });
    router.push("/authority/tender-applications");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Tender" description="Publish a new tender so approved contractors can apply." />
      <div className="grid gap-4 max-w-2xl">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Description (optional)" />
        <Input placeholder="Area" value={area} onChange={(e) => setArea(e.target.value)} />
        <Input placeholder="Budget" type="number" value={budget as any} onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : "")} />
        <Input placeholder="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <div className="flex justify-end"><Button onClick={submit}>Publish Tender</Button></div>
      </div>
    </div>
  );
}
