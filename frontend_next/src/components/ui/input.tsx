import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("h-11 w-full rounded-xl border bg-white/80 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400 dark:bg-white/[0.06]", className)}
    {...props}
  />
));
Input.displayName = "Input";
