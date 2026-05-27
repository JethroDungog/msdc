import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata = {
  title: 'Admin Dashboard — MSDC',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/leader-dashboard')

  const [{ data: announcements }, { data: leaders }, { data: memberCounts }, { data: events }] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title, body, created_at, profiles(full_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'leader')
      .order('full_name', { ascending: true }),
    supabase
      .from('members')
      .select('leader_id'),
    supabase
      .from('events')
      .select('id, title, description, event_date, created_at, profiles!created_by(full_name)')
      .order('event_date', { ascending: true }),
  ])

  // Build member count per leader
  const countMap: Record<string, number> = {}
  memberCounts?.forEach((m) => {
    countMap[m.leader_id] = (countMap[m.leader_id] ?? 0) + 1
  })

  return (
    <AdminDashboardClient
      profile={profile}
      initialAnnouncements={(announcements ?? []) as unknown as Parameters<typeof AdminDashboardClient>[0]['initialAnnouncements']}
      initialLeaders={(leaders ?? []).map((l) => ({
        ...l,
        memberCount: countMap[l.id] ?? 0,
      }))}
      initialEvents={(events ?? []) as unknown as Parameters<typeof AdminDashboardClient>[0]['initialEvents']}
    />
  )
}
