"use client";

import React, { useEffect, useState } from "react";
import { publicService } from "@/services/public.service";
import Link from "next/link";

export default function FeaturedPublicCases() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    publicService.publicCases().then((res) => {
      setCases(res.filter((c: any) => c.is_featured).slice(0, 3));
    });
  }, []);

  if (!cases || cases.length === 0) return null;

  return (
    <div className="mt-8 grid gap-4">
      {cases.map((c: any) => (
        <Link key={c.id} href={`/public-cases/${c.id}`} className="block rounded-2xl bg-white/60 p-4 dark:bg-white/[0.04] shadow-glow">
          <h3 className="font-bold">{c.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{c.area} • {c.status}</p>
        </Link>
      ))}
    </div>
  );
}
