import Link from "next/link";
import { ArrowRight, BadgeCheck, Landmark, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const features: Array<{ title: string; text: string; icon: LucideIcon }> = [
    { title: "Citizen services", text: "Police requests, OTP, NID, status tracking", icon: BadgeCheck },
    { title: "Officer workflows", text: "Assigned cases, updates, document uploads", icon: ShieldCheck },
    { title: "Admin governance", text: "Approvals, statistics, tenders, audit logs", icon: Landmark },
  ];

  return (
    <main className="min-h-screen bg-civic-mist bg-grid-light bg-[size:28px_28px] dark:bg-civic-ink dark:bg-grid-dark">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-extrabold">CivicLens</Link>
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link href="/about">About</Link></Button>
          <Button asChild variant="secondary"><Link href="/login">Login</Link></Button>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="font-bold text-cyan-500">FastAPI-powered GovTech operations</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">Civic governance with one clear operational lens.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            CivicLens connects citizens, police officers, authorities, contractors, and administrators across complaints, GDs, verification, tenders, assignments, documents, and audit trails.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/login">Access platform <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="secondary"><Link href="/register">Create account</Link></Button>
          </div>
        </div>
        <Card className="p-5">
          <div className="grid gap-4">
            {features.map(({ title, text, icon: Icon }) => (
              <div key={title} className="rounded-2xl bg-white/60 p-5 dark:bg-white/[0.04]">
                <Icon className="h-6 w-6 text-cyan-500" />
                <h2 className="mt-4 font-bold">{title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
