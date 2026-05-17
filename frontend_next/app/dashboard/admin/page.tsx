"use client"
import React from 'react'
import Card from '../../../components/Card'
import AdminStats from '../../../components/charts/LineChartCard'
import ProtectedClient from '../../../components/ProtectedClient'

export default function AdminDashboard(){
  return (
    <ProtectedClient>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card title="Total Cases" value="124" />
          <Card title="Pending Approvals" value="8" />
          <Card title="Active Investigations" value="21" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminStats />
        </div>
      </div>
    </ProtectedClient>
  )
}
