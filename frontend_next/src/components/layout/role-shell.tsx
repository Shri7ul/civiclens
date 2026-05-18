"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Aperture, Bell, LogOut, Menu, Moon, Search, Sun, LockKeyhole } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { roleNavigation } from "@/lib/rbac";
import { useApiQuery } from "@/hooks/use-api-query";
import { verificationService } from "@/services/verification.service";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

function Sidebar({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = roleNavigation[role];
  const { session } = useAuth();
  const router = useRouter();
  const verificationQuery = useApiQuery(() => (session ? verificationService.getStatus(session.user_id) : Promise.resolve(null)), [session?.user_id]);
  return (
    <aside className="flex h-full flex-col gap-6 p-5">
      <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-lime-300 text-white shadow-glow">
          <Aperture className="h-6 w-6" />
        </span>
        <span>
          <span className="block text-lg font-extrabold tracking-tight">CivicLens</span>
          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{role} workspace</span>
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-2">
        {items.map(({ title, href, icon: Icon }) => {
          const isSubmit = role === "citizen" && href === "/citizen/submit-police-request";
          const locked = isSubmit && !(verificationQuery.data?.verification_completed);

          if (locked) {
            return (
              <div
                key={href}
                onClick={() => router.push("/citizen/dashboard")}
                title="Complete verification to unlock"
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition opacity-60 cursor-pointer",
                  pathname === href
                    ? "bg-slate-950 text-white shadow-glow dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{title}</span>
                <LockKeyhole className="ml-auto h-4 w-4 text-rose-500" />
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition",
                pathname === href
                  ? "bg-slate-950 text-white shadow-glow dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" />
              {title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function RoleShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading, logout, role: activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (activeRole && activeRole !== role) {
      router.replace(roleNavigation[activeRole][0].href);
    }
  }, [activeRole, isAuthenticated, isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-civic-mist p-6 dark:bg-civic-ink">
        <Skeleton className="h-16 w-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || activeRole !== role) {
    return null;
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;

    const match = roleNavigation[role].find((item) =>
      `${item.title} ${item.href}`.toLowerCase().includes(query),
    );

    if (!match) {
      toast.info("No matching workspace section found");
      return;
    }

    setSearch("");
    router.push(match.href);
  }

  return (
    <div className="min-h-screen bg-civic-mist bg-grid-light bg-[size:28px_28px] dark:bg-civic-ink dark:bg-grid-dark">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-white/[0.72] backdrop-blur-2xl dark:bg-white/[0.05] lg:block">
        <Sidebar role={role} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} aria-label="Close navigation" />
            <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className="relative h-full w-80 max-w-[86vw] bg-white shadow-2xl dark:bg-civic-ink">
              <Sidebar role={role} onNavigate={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b bg-civic-mist/78 px-4 py-3 backdrop-blur-2xl dark:bg-civic-ink/72 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
            <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 items-center gap-3 rounded-2xl border bg-white/70 px-4 py-2.5 dark:bg-white/[0.06] md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search workspace sections..." />
            </form>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={() => toast.info("No new notifications")} aria-label="Notifications"><Bell className="h-5 w-5" /></Button>
              <Button variant="secondary" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
