"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function Header(){
  const router = useRouter()

  function handleLogout(){
    try{localStorage.removeItem('civiclens_user')}catch(e){}
    router.replace('/login')
  }

  return (
    <div className="flex items-center gap-4">
      <button onClick={()=>router.push('/profile')} className="px-3 py-1 bg-slate-800 rounded-md">Profile</button>
      <button onClick={handleLogout} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-md">Logout</button>
    </div>
  )
}
