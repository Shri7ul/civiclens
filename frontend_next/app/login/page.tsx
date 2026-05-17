"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '../../services/api'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const data = await login({ email, password })
      // expected backend to return { user_id, role }
      const session = { user_id: data.user_id ?? data.id ?? null, role: data.role ?? data.user?.role ?? data.role_name }
      localStorage.setItem('civiclens_user', JSON.stringify(session))
      // redirect based on role
      const role = (session as any).role && (session as any).role.toString().toLowerCase()
      if (role === 'citizen' || role === 'user') router.push('/dashboard/citizen')
      else if (role === 'officer') router.push('/dashboard/officer')
      else if (role === 'authority') router.push('/dashboard/authority')
      else if (role === 'admin') router.push('/dashboard/admin')
      else router.push('/')
    }catch(err:any){
      setError(String(err))
    }finally{setLoading(false)}
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 mb-2 rounded bg-slate-900" />
          <input placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full p-2 mb-4 rounded bg-slate-900" />
          {error && <div className="text-red-400 mb-2">{error}</div>}
          <button disabled={loading} className="w-full py-2 bg-indigo-600 rounded">{loading? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}
