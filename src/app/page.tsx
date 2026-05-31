import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PublicLandingClient from './PublicLandingClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <PublicLandingClient />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin-dashboard')
  } else {
    redirect('/leader-dashboard')
  }
}
