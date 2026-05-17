"use client"
import React from 'react'

export default function Timeline({ items }: { items: Array<{ id: number; title: string; time?: string; status?: string }> }){
  return (
    <div className="space-y-4">
      {items.map(it=> (
        <div key={it.id} className="flex items-start gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-indigo-400" />
          <div>
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="text-xs text-slate-400">{it.time ?? 'Unknown'} • {it.status}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
