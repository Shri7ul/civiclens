"use client";

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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ nid: string; dob: string; address?: string }>();
  async function onSubmit(values: { nid: string; dob: string; address?: string }) {
    if (!session) return;

    try {
      await verificationService.verifyNid({ user_id: session.user_id, nid: values.nid, dob: values.dob, address: values.address ?? "" });
      toast.success("NID submitted for verification");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not submit NID verification."));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>NID Verification</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Input placeholder="Enter NID number" {...register("nid", { required: true })} />
            {errors.nid && <p className="mt-1 text-sm text-rose-500">NID number is required.</p>}
            <Input placeholder="Date of birth (YYYY-MM-DD)" {...register("dob", { required: true })} />
            {errors.dob && <p className="mt-1 text-sm text-rose-500">DOB is required.</p>}
            <Input placeholder="Address (optional)" {...register("address")} />
          </div>
          <Button disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
