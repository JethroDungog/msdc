import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Public routes (no auth needed) ──────────────────────────
  const publicRoutes = ['/login', '/api/auth']
  const isPublicRoute = pathname === '/' || publicRoutes.some((route) => pathname.startsWith(route))

  // ── Unauthenticated: redirect to /login ─────────────────────
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // ── Authenticated: redirect away from /login ─────────────────
  if (user && pathname === '/login') {
    // Fetch role to determine correct dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname =
      profile?.role === 'admin' ? '/admin-dashboard' : '/leader-dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // ── Role-based route protection ──────────────────────────────
  if (user && (pathname.startsWith('/admin-dashboard') || pathname.startsWith('/leader-dashboard'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (pathname.startsWith('/admin-dashboard') && profile?.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/leader-dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/leader-dashboard') && profile?.role === 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin-dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
