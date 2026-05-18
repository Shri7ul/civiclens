import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-civic-mist p-4 dark:bg-civic-ink">
      <div className="mx-auto max-w-5xl py-16">
        <Button asChild variant="ghost"><Link href="/">Back</Link></Button>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-4xl">About CivicLens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>CivicLens is designed around a FastAPI backend that manages authentication, police requests, case assignment, tender workflows, approvals, and audit logs.</p>
            <p>The frontend separates each role into its own protected workspace so citizens, officers, authorities, contractors, and admins only see the workflows they can operate.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
