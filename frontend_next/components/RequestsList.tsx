"use client"
import React, { useState } from 'react'
import ProgressTracker from './ProgressTracker'
import { getCaseUpdates } from '../services/api'
import TimelineCard from './TimelineCard'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function RequestsList({ requests }: { requests: Array<any> }){
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [updates, setUpdates] = useState<Record<number, any[]>>({})
  const [loadingUpdates, setLoadingUpdates] = useState<Record<number, boolean>>({})

  async function toggle(id:number){
    const isOpen = !!expanded[id]
    setExpanded(s=>({ ...s, [id]: !isOpen }))
    if (!isOpen && !updates[id]){
      setLoadingUpdates(s=>({ ...s, [id]: true }))
      try{
        const res = await getCaseUpdates(id)
        setUpdates(s=>({ ...s, [id]: res }))
      }catch(e){
        setUpdates(s=>({ ...s, [id]: [] }))
      }finally{
        setLoadingUpdates(s=>({ ...s, [id]: false }))
      }
    }
  }

  if (!requests || requests.length === 0) return (<div className="text-slate-400">No GD requests found</div>)

  return (
    <div className="space-y-4">
      {requests.map((r:any)=> (
        <motion.div layout key={r.id} className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-300 font-semibold">{r.category} — {r.request_type}</div>
              <div className="text-xs text-slate-400">#{r.id} • {new Date(r.created_at ?? Date.now()).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-200">Status: <span className="font-semibold">{r.status}</span></div>
              <button onClick={()=>toggle(r.id)} className="p-2 rounded hover:bg-slate-800/40">
                {expanded[r.id] ? <ChevronUp/> : <ChevronDown/>}
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-slate-300 mb-2">{r.description}</div>
            <ProgressTracker status={r.status} />
          </div>

          {expanded[r.id] && (
            <div className="mt-3 space-y-2">
              {loadingUpdates[r.id] ? <div className="text-slate-400">Loading timeline...</div> : (
                (updates[r.id] || []).length === 0 ? <div className="text-slate-400">No updates available</div> : (
                  updates[r.id].map((u:any)=> <TimelineCard key={u.id} update={u} />)
                )
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
