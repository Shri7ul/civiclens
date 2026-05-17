import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', cases: 12 },
  { name: 'Tue', cases: 18 },
  { name: 'Wed', cases: 8 },
  { name: 'Thu', cases: 20 },
  { name: 'Fri', cases: 16 },
]

export default function LineChartCard(){
  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-2">Cases Over Time</h3>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#9aa4b2" />
            <YAxis stroke="#9aa4b2" />
            <Tooltip />
            <Line type="monotone" dataKey="cases" stroke="#7c3aed" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
