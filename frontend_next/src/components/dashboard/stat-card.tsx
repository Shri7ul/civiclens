import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

function useAnimatedNumber(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = Number(value);
    const diff = target - from;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(from + diff * t));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  const num = useAnimatedNumber(Number(value ?? 0));
  return (
    <Card className="relative overflow-hidden p-5 bg-white/6 border border-white/6 backdrop-blur-sm transition-shadow hover:shadow-[0_10px_30px_rgba(34,211,238,0.08)]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-cyan-400/20 to-sky-600/10 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white">{num}</h3>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-cyan-400/70 to-blue-600/90 p-3 text-white shadow-glow transform transition-transform hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
