"use client"
import React from 'react'

const steps = ['Submitted', 'Assigned', 'Investigating', 'Resolved']

export default function ProgressTracker({ status }: { status: string }){
  const idx = steps.findIndex(s => s.toLowerCase() === status?.toLowerCase())
  const active = idx === -1 ? 0 : idx
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        {steps.map((s,i)=> (
          <div key={s} className={`flex-1 text-center ${i<=active? 'text-white': ''}`}>{s}</div>
        ))}
      </div>
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${(Math.max(0, active)/(steps.length-1))*100}%` }} />
      </div>
    </div>
  )
}
