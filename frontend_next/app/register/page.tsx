"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '../../services/api'

export default function RegisterPage(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try{
      const data = await register({ name, email, password })
      alert('Registration successful')
      router.push('/login')
    }catch(err:any){
      setError(String(err))
    }finally{setLoading(false)}
  }

  return (
    <div className="max-w-2xl mx-auto py-20">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 mb-2 rounded bg-slate-900" />
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 mb-2 rounded bg-slate-900" />
          <input placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full p-2 mb-2 rounded bg-slate-900" />
          <input placeholder="Confirm Password" value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" className="w-full p-2 mb-4 rounded bg-slate-900" />
          {error && <div className="text-red-400 mb-2">{error}</div>}
          <button disabled={loading} className="w-full py-2 bg-indigo-600 rounded">{loading? 'Creating...' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  )
}
