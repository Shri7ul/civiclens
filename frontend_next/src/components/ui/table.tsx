import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full min-w-[760px] text-left text-sm", className)} {...props} />;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border bg-white/[0.82] shadow-soft dark:bg-white/[0.06]"><div className="overflow-x-auto">{children}</div></div>;
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-5 py-4 text-xs uppercase tracking-wide text-slate-500", className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-t px-5 py-4 dark:border-white/10", className)} {...props} />;
}
