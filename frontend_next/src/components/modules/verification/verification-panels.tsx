"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { getErrorMessage } from "@/lib/errors";
import { verificationService } from "@/services/verification.service";

export function VerificationStatusPanel() {
  const { session } = useAuth();
  const query = useApiQuery(() => session ? verificationService.getStatus(session.user_id) : Promise.resolve(null), [session?.user_id]);
  // Listen for external verification updates and refetch
  React.useEffect(() => {
    function handler() {
      query.refetch();
    }
    window.addEventListener("verification-updated", handler);
    return () => window.removeEventListener("verification-updated", handler);
  }, [query]);
  if (query.loading) return <Skeleton className="h-40" />;
  if (query.error) return <EmptyState title="Status unavailable" description={query.error} />;
  return <Card><CardHeader><CardTitle>Verification Status</CardTitle></CardHeader><CardContent><pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-cyan-100">{JSON.stringify(query.data, null, 2)}</pre></CardContent></Card>;
}

export function OtpVerificationForm() {
  const { session } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ otp: string }>();
  async function onSubmit({ otp }: { otp: string }) {
    if (!session) return;

    try {
      await verificationService.verifyOtp({ user_id: session.user_id, otp_code: otp });
      toast.success("OTP verified");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not verify OTP."));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>OTP Verification</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input placeholder="Enter OTP" {...register("otp", { required: true })} />
            {errors.otp && <p className="mt-1 text-sm text-rose-500">OTP is required.</p>}
          </div>
          <Button disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function NidVerificationForm() {
  const { session } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!file) {
      toast.error("Please choose an NID image to upload.");
      return;
    }

    const form = new FormData();
    form.append("user_id", String(session.user_id));
    form.append("file", file);

    try {
      setIsSubmitting(true);
      const res = await verificationService.uploadNidImage(form);
      if (res && res.message) {
        if (res.extracted && res.extracted.nid && res.extracted.dob && res.message && res.message.toLowerCase().includes("successful")) {
          toast.success("NID extracted and account verified");
          // notify other components to refresh status
          window.dispatchEvent(new Event("verification-updated"));
        } else {
          toast.error(res.message || "OCR parsing incomplete. Please try a clearer image.");
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not upload NID image."));
    } finally {
      setIsSubmitting(false);
      setFile(null);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Upload NID Image</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(ev) => setFile(ev.target.files ? ev.target.files[0] : null)}
            />
            <p className="text-sm text-muted-foreground">Upload front-side of your NID card (clear photo).</p>
          </div>
          <Button disabled={isSubmitting}>{isSubmitting ? "Uploading..." : "Upload & Verify"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
