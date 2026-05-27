'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  userFullName: string
  userRole: 'admin' | 'leader'
}

export default function Navbar({ userFullName, userRole }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.07]"
      style={{ background: 'rgba(26,26,26,0.92)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src="/logo.jpg"
              alt="MSDC"
              fill
              className="object-cover rounded-full ring-2 ring-red-600/50"
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-white text-base leading-none">MSDC</span>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5 tracking-wide uppercase">
              My Soul Desire Church
            </p>
          </div>
          <span className="sm:hidden font-bold text-white text-base">MSDC</span>
        </div>

        {/* Dashboard label */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-300 font-medium">
            {userRole === 'admin' ? 'Admin Dashboard' : 'Leader Dashboard'}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {userFullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white leading-none">{userFullName}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 capitalize">{userRole}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-ghost text-sm px-3 py-2 gap-1.5"
            title="Sign out"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
