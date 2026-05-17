"use client"
import ProtectedClient from '../../../components/ProtectedClient'
import StatCard from '../../../components/StatCard'
import Timeline from '../../../components/Timeline'
import RequestsList from '../../../components/RequestsList'
import SkeletonCard from '../../../components/SkeletonCard'
import { useEffect, useState, useCallback } from 'react'
import { getMyPoliceRequests } from '../../../services/api'
import SubmitGDForm from '../../../components/SubmitGDForm'
import { Clock, CheckCircle, AlertTriangle, Activity } from 'lucide-react'

export default function CitizenDashboard(){
  const [requests, setRequests] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(()=>{
    // read user from localStorage only on client-side
    const s = typeof window !== 'undefined' ? localStorage.getItem('civiclens_user') : null
    const user = s ? JSON.parse(s) : null
    setUserId(user?.user_id ?? null)

    const fetch = async (uid: number | null)=>{
      try{
        if (uid){
          const data = await getMyPoliceRequests(uid)
          setRequests(data)
        }else{
          setRequests([])
        }
      }catch(e){setRequests([])}
      finally{setLoading(false)}
    }
    fetch(user?.user_id ?? null)
  },[])

  const refresh = useCallback(()=>{
    setLoading(true)
    if (userId){
      getMyPoliceRequests(userId).then(data=>{setRequests(data); setLoading(false)}).catch(()=>{setRequests([]); setLoading(false)})
    }else{setRequests([]); setLoading(false)}
  },[userId])

  const total = requests ? requests.length : 0
  const active = requests ? requests.filter(r=>r.status && r.status.toLowerCase() !== 'resolved').length : 0
  const resolved = requests ? requests.filter(r=>r.status && r.status.toLowerCase() === 'resolved').length : 0
  const pending = requests ? requests.filter(r=>r.status && r.status.toLowerCase() === 'pending').length : 0

  return (
    <ProtectedClient>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Citizen Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            Array.from({length:4}).map((_,i)=>(<SkeletonCard key={i}/>))
          ) : (
            <>
              <StatCard title="Total GD Submitted" value={total} icon={<Activity/>} />
              <StatCard title="Active Investigations" value={active} icon={<AlertTriangle/>} />
              <StatCard title="Resolved Cases" value={resolved} icon={<CheckCircle/>} />
              <StatCard title="Pending Cases" value={pending} icon={<Clock/>} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Cases</h3>
              </div>
              {loading ? <SkeletonCard/> : <RequestsList requests={requests || []} />}
            </div>
          </div>

          <div>
            <div className="space-y-6">
              {userId ? (
                <SubmitGDForm userId={userId} onSuccess={refresh} />
              ) : (
                <div className="card p-4 text-sm text-slate-400">Login to submit a GD</div>
              )}

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                {loading ? <SkeletonCard/> : <Timeline items={(requests||[]).slice(0,6).map(r=>({ id: r.id, title: r.category + ' • ' + r.request_type, time: r.created_at, status: r.status }))} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedClient>
  )
}
