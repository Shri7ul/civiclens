"use client"
import ProtectedClient from '../../../components/ProtectedClient'

export default function AuthorityDashboard(){
  return (
    <ProtectedClient>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Authority Dashboard</h2>
        <p className="text-slate-300">Pending GDs and assignment tools.</p>
      </div>
    </ProtectedClient>
  )
}
