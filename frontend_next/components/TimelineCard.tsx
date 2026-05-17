"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function TimelineCard({ update }: { update: any }){
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{update.title ?? update.note ?? 'Update'}</div>
          <div className="text-xs text-slate-400">{new Date(update.created_at ?? Date.now()).toLocaleString()}</div>
        </div>
        <button onClick={()=>setOpen(o=>!o)} className="p-1 rounded hover:bg-slate-800/40">
          {open ? <ChevronUp/> : <ChevronDown/>}
        </button>
      </div>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-3 text-slate-300 text-sm">
          {update.details ?? update.description ?? 'No further details.'}
        </motion.div>
      )}
    </motion.div>
  )
}
