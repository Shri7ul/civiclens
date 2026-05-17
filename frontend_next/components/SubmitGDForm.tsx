"use client"
import React, { useState } from 'react'
import { addPoliceRequest } from '../services/api'
import { MotionConfig, motion } from 'framer-motion'
import { Send, CheckCircle, XCircle } from 'lucide-react'

export default function SubmitGDForm({ userId, onSuccess }: { userId: number; onSuccess?: ()=>void }){
  const [category, setCategory] = useState('Public Safety')
  const [requestType, setRequestType] = useState('General Complaint')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success'|'error'; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    try{
      await addPoliceRequest({ user_id: userId, category, request_type: requestType, description })
      setToast({ type: 'success', message: 'GD submitted successfully' })
      setDescription('')
      onSuccess && onSuccess()
    }catch(err:any){
      setToast({ type: 'error', message: String(err) || 'Submission failed' })
    }finally{setLoading(false); setTimeout(()=>setToast(null), 4000)}
  }

  return (
    <MotionConfig>
      <div className="card p-4 bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Submit GD</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-300 block mb-1">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 rounded bg-slate-900/50 border border-slate-700/30">
              <option>Public Safety</option>
              <option>Traffic</option>
              <option>Theft</option>
              <option>Vandalism</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Request Type</label>
            <input value={requestType} onChange={e=>setRequestType(e.target.value)} className="w-full p-2 rounded bg-slate-900/50 border border-slate-700/30" />
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full p-2 rounded bg-slate-900/50 border border-slate-700/30" />
          </div>

          <div className="flex items-center justify-between">
            <button disabled={loading} type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-400 text-slate-900 font-semibold rounded shadow hover:scale-[1.01] transition-transform disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit GD'} <Send size={16} />
            </button>
          </div>
        </form>

        {toast && (
          <motion.div initial={{ opacity:0, y: -8 }} animate={{ opacity:1, y:0 }} className={`mt-3 flex items-center gap-2 p-2 rounded ${toast.type==='success'? 'bg-emerald-600/20 border border-emerald-400/20' : 'bg-red-600/10 border border-red-400/10'}`}>
            {toast.type==='success' ? <CheckCircle/> : <XCircle/>}
            <div className="text-sm">{toast.message}</div>
          </motion.div>
        )}
      </div>
    </MotionConfig>
  )
}
