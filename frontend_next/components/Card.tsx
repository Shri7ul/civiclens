import React from 'react'

export default function Card({ title, value }: { title: string; value: string | number }){
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-slate-500">📁</div>
      </div>
    </div>
  )
}
