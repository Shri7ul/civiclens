"use client"
import React from 'react'

export default function SkeletonCard(){
  return (
    <div className="animate-pulse bg-slate-800/40 rounded-lg p-4">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
      <div className="h-10 bg-slate-700 rounded w-full" />
    </div>
  )
}
