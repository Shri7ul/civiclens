import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
  approved: "bg-lime-500/10 text-lime-600 ring-lime-500/20",
  rejected: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
  assigned: "bg-cyan-500/10 text-cyan-600 ring-cyan-500/20",
  investigating: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
  closed: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
};

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  const key = String(children).toLowerCase();
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1", statusColors[key] || "bg-cyan-500/10 text-cyan-600 ring-cyan-500/20", className)}>{children}</span>;
}
