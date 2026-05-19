"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { policeService } from "@/services/police.service";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { verificationService } from "@/services/verification.service";
import { useState } from "react";

interface FormValues {
  description: string;
  area?: string;
  location?: string;
  category?: string;
  request_type?: string;
}

export function PoliceRequestForm() {
  const { session } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues: { category: "General", request_type: "Complaint" } });
  const [files, setFiles] = useState<FileList | null>(null);
  const verificationQuery = useApiQuery(() => (session ? verificationService.getStatus(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  const locked = !(verificationQuery.data?.verification_completed);

  async function onSubmit(values: FormValues) {
    if (!session) {
      toast.error("You must be signed in to submit a request");
      return;
    }

    interface PoliceRequestPayload {
      user_id: number;
      category: string;
      request_type: string;
      description: string;
      area?: string;
      location?: string;
    }

    const payload: PoliceRequestPayload = {
      user_id: session.user_id,
      category: values.category ?? "Other",
      request_type: values.request_type ?? "Complaint",
      description: values.description,
      area: values.area,
      location: values.location
    };

    try {
      await policeService.addPoliceRequest(payload);
      toast.success("Police request / GD submitted");
      reset();
      if (files && files.length > 0) {
        toast.info("Files selected. Attachments can be uploaded from the request details after creation.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not submit the police request."));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Submit Police Request / GD</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <select className="h-11 rounded-xl border bg-white/80 px-3 text-sm dark:bg-white/[0.06]" {...register("area")}> 
            <option value="">Select area</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            <option value="Khulna">Khulna</option>
            <option value="Rajshahi">Rajshahi</option>
            <option value="Sylhet">Sylhet</option>
            <option value="Barishal">Barishal</option>
            <option value="Rangpur">Rangpur</option>
          </select>
          <Input placeholder="Location (e.g. Mirpur 12, Uttara Sector 7)" {...register("location")} />
          <select className="h-11 rounded-xl border bg-white/80 px-3 text-sm dark:bg-white/[0.06]" {...register("category")}> 
            <option value="Other">Other</option>
            <option value="Theft">Theft</option>
            <option value="Assault">Assault</option>
            <option value="Murder">Murder</option>
            <option value="Missing Person">Missing Person</option>
            <option value="Harassment">Harassment</option>
            <option value="Cyber Crime">Cyber Crime</option>
            <option value="Drug Activity">Drug Activity</option>
            <option value="Corruption">Corruption</option>
            <option value="Kidnapping">Kidnapping</option>
            <option value="Domestic Violence">Domestic Violence</option>
            <option value="Terror Threat">Terror Threat</option>
            <option value="Fraud">Fraud</option>
            <option value="Extortion">Extortion</option>
            <option value="Human Trafficking">Human Trafficking</option>
            <option value="Public Disturbance">Public Disturbance</option>
          </select>
          <select className="h-11 rounded-xl border bg-white/80 px-3 text-sm dark:bg-white/[0.06]" {...register("request_type")}> 
            <option value="Complaint">Complaint</option>
            <option value="GD">GD</option>
            <option value="Report">Report</option>
          </select>
          <Textarea placeholder="Describe the incident or GD request" {...register("description", { required: true })} />
          {errors.description && <p className="text-sm text-rose-500">Description is required.</p>}
          <div>
            <label className="block text-sm font-semibold">Attach evidence (optional)</label>
            <input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setFiles(e.target.files)} className="mt-2" />
            {files && <div className="mt-2 text-sm text-slate-300">{files.length} file(s) selected</div>}
          </div>
          {locked && <p className="text-sm text-rose-500">Complete verification to unlock full submission features.</p>}
          <Button className="justify-self-end" disabled={isSubmitting || locked}>{isSubmitting ? "Submitting..." : "Submit request"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
