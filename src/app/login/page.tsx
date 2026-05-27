'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/')
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Redirect handled by middleware → role-based
    router.push('/')
    router.refresh()
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* ── Backdrop image with Blur to prevent text clash ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/backdrop.jpg"
          alt="My Soul Desire Church"
          fill
          className="object-cover object-center blur-[6px] scale-105 opacity-80"
          priority
        />
        {/* Harmonious Dark Overlay for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/80 to-red-950/40" />
        {/* Soft bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ── Login Card ───────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="bg-[#18181b]/85 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] shadow-black/80">

          {/* Logo + Church Name */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-20 h-20 mb-3 drop-shadow-2xl">
              <Image
                src="/logo.jpg"
                alt="MSDC Logo"
                fill
                className="object-cover rounded-full ring-2 ring-red-500/50 ring-offset-2 ring-offset-zinc-900 shadow-md"
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">MSDC</h1>
            <p className="text-xs text-red-200/60 mt-1 tracking-widest font-semibold uppercase">
              My Soul Desire Church
            </p>
            <div className="mt-3 h-0.5 w-16 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </div>

          {/* Welcome Text */}
          <div className="mb-6 text-center">
            <h2 className="text-base font-bold text-zinc-100 tracking-wide uppercase">Ministry Portal</h2>
            <p className="text-xs text-zinc-400 mt-1">Sign in to access your dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-950/40 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" id="login-form">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pastor@msdc.church"
                  required
                  autoComplete="email"
                  className="w-full bg-zinc-950/40 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-zinc-950/40 border border-zinc-800 rounded-xl py-3 pl-11 pr-11 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 hover:shadow-red-900/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} My Soul Desire Church · All rights reserved
          </p>
        </div>
      </div>

      {/* Decorative red glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
    </main>
  )
}
