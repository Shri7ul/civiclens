import './globals.css'
import React from 'react'
import Header from '../components/Header'

export const metadata = {
  title: 'CivicLens',
  description: 'CivicLens Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <aside className="w-64 hidden md:block bg-transparent p-6">
            <div className="text-2xl font-semibold mb-6">CivicLens</div>
            <nav className="flex flex-col gap-2 text-slate-300">
              <a href="/dashboard/admin" className="hover:text-white">Admin</a>
              <a href="/dashboard/officer" className="hover:text-white">Officer</a>
              <a href="/dashboard/citizen" className="hover:text-white">Citizen</a>
            </nav>
          </aside>
          <main className="flex-1 p-6">
            <header className="flex items-center justify-between mb-6">
              <div className="text-xl font-semibold">Dashboard</div>
              <Header />
            </header>
            <div className="container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
