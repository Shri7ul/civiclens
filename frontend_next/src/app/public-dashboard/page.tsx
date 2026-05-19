"use client";

import React from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { publicService } from "@/services/public.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./styles.module.css";

export default function PublicDashboardPage() {
  const statsQ = useApiQuery(() => publicService.dashboard(), []);
  const casesQ = useApiQuery(() => publicService.publicCases(), []);

  if (statsQ.loading || casesQ.loading) return <Skeleton className="h-64" />;

  const areas = statsQ.data ?? [];
  const cases = casesQ.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Public Transparency Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.mapWrap}>
                <svg className={styles.mapSvg} viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">
                  {/* Center Dhaka */}
                  {areas.map((a:any, idx:number) => {
                    // simple placement for five areas
                    const positions:any = {
                      Dhaka: { x: 400, y: 210 },
                      Chittagong: { x: 620, y: 90 },
                      Khulna: { x: 140, y: 90 },
                      Sylhet: { x: 140, y: 330 },
                      Rajshahi: { x: 620, y: 330 }
                    };
                    const p = positions[a.area] || { x: 100 + idx*120, y: 80 };

                    return (
                      <g key={a.area} className={styles.areaGroup} transform={`translate(${p.x},${p.y})`}>
                        <circle r="56" className={styles.areaCircle} />
                        <text x="0" y="-4" textAnchor="middle" className={styles.areaTitle}>{a.area}</text>
                        <text x="0" y="14" textAnchor="middle" className={styles.areaStat}>Pending: {a.pending_cases}</text>
                        <text x="0" y="30" textAnchor="middle" className={styles.areaStat}>Resolved: {a.resolved_cases}</text>
                      </g>
                    );
                  })}

                  {/* lines from Dhaka to others */}
                  {(() => {
                    const center = { x: 400, y: 210 };
                    const others = areas.filter((a:any) => a.area !== 'Dhaka');
                    return others.map((o:any, i:number) => {
                      const positions:any = {
                        Chittagong: { x: 620, y: 90 },
                        Khulna: { x: 140, y: 90 },
                        Sylhet: { x: 140, y: 330 },
                        Rajshahi: { x: 620, y: 330 }
                      };
                      const p = positions[o.area];
                      if (!p) return null;
                      return <line key={o.area} x1={center.x} y1={center.y} x2={p.x} y2={p.y} className={styles.linkLine} />;
                    });
                  })()}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Public Demand Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? <div className="text-sm text-slate-400">No public cases</div> : (
                <div className="space-y-4">
                  {cases.map((c:any) => (
                    <div key={c.id} className="p-3 border border-slate-700 rounded-md bg-black/30">
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-slate-300">Status: {c.status} — Area: {c.area}</div>
                      <div className="text-sm text-slate-400">Assigned: {c.assigned_officer?.name ?? 'Unassigned'}</div>
                      <div className="text-sm text-slate-400">Updated: {c.updated_at ? new Date(c.updated_at).toLocaleString() : '-'}</div>
                      {c.source_url ? <a href={c.source_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm text-cyan-400 hover:underline">Source: {c.source_name ?? 'link'}</a> : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
