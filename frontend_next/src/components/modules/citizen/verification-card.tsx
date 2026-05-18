"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useApiQuery } from "@/hooks/use-api-query";
import { verificationService } from "@/services/verification.service";

export function VerificationCard() {
  const router = useRouter();
  const { session } = useAuth();
  const query = useApiQuery(() => (session ? verificationService.getStatus(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  const status = query.data ?? { verified: false, nid_verified: false, verification_completed: false };
  const progress = (status.verified ? 50 : 0) + (status.nid_verified ? 50 : 0);

  function handleVerify() {
    if (!status.verified) return router.push("/citizen/otp-verification");
    if (!status.nid_verified) return router.push("/citizen/nid-verification");
    return;
  }

  const buttonLabel = !status.verified ? "Verify OTP" : !status.nid_verified ? "Verify NID" : "Fully Verified";
  const buttonVariant = !status.verified ? "destructive" : !status.nid_verified ? "secondary" : "secondary";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-sm text-slate-300">Verification progress indicates how much of your account verification is complete.</div>
        <div className="w-full rounded-full bg-slate-800/30 h-3">
          <div className={`h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500`} style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-slate-200">{progress}% complete</div>
          <Button onClick={handleVerify} disabled={status.verification_completed} variant={buttonVariant as any}>{status.verification_completed ? "Verified" : buttonLabel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
