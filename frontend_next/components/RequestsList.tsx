"use client"
import React from 'react'
import ProgressTracker from './ProgressTracker'

export default function RequestsList({ requests }: { requests: Array<any> }){
  return (
    <div className="space-y-4">
      {requests.map((r:any)=> (
        <div key={r.id} className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-300 font-semibold">{r.category} — {r.request_type}</div>
              <div className="text-xs text-slate-400">#{r.id} • {new Date(r.created_at ?? Date.now()).toLocaleString()}</div>
            </div>
            <div className="text-sm text-slate-200">Status: <span className="font-semibold">{r.status}</span></div>
          </div>
          <div className="mt-3">
            <div className="text-slate-300 mb-2">{r.description}</div>
            <ProgressTracker status={r.status} />
          </div>
        </div>
      ))}
    </div>
  )
}
