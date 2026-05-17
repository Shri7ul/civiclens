"use client"
import { motion } from 'framer-motion'
import React from 'react'

export default function StatCard({ title, value, icon }: { title: string; value: number; icon?: React.ReactNode }){
  return (
    <motion.div whileHover={{ y: -6 }} className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-md border border-slate-700/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-extrabold">{value}</motion.div>
        </div>
        <div className="text-slate-400 text-2xl">{icon}</div>
      </div>
    </motion.div>
  )
}
