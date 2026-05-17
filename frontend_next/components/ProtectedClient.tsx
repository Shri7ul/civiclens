"use client"
import { useEffect, PropsWithChildren } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedClient({ children }: PropsWithChildren) {
  const router = useRouter()

  useEffect(() => {
    try{
      const s = localStorage.getItem('civiclens_user')
      if (!s) router.replace('/login')
    }catch(e){
      router.replace('/login')
    }
  }, [router])

  return <>{children}</>
}
