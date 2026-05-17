"use client"
import ProtectedClient from '../../../components/ProtectedClient'

export default function OfficerDashboard(){
  return (
    <ProtectedClient>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Officer Dashboard</h2>
        <p className="text-slate-300">Assigned cases and evidence tools.</p>
      </div>
    </ProtectedClient>
  )
}
