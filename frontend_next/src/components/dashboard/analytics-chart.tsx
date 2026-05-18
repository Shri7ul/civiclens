"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const emptyTrend = [
  { name: "Requests", value: 0 },
  { name: "Cases", value: 0 },
  { name: "Tenders", value: 0 },
  { name: "Approvals", value: 0 },
];

export function AnalyticsChart({ data = emptyTrend }: { data?: Array<{ name: string; value: number }> }) {
  const hasData = data && data.some((d) => d.value > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow analytics</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {!hasData ? (
          <div className="h-full"><EmptyState title="No analytics" description="No workflow data available." /></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(val: any) => [val, "Count"]} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="url(#g1)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
