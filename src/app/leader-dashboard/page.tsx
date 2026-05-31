import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeaderDashboardClient from './LeaderDashboardClient'
import type { Announcement, Member, Visitor } from '@/lib/types'

export const metadata = {
  title: 'Leader Dashboard — MSDC',
}

export default async function LeaderDashboardPage() {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile check
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'leader') redirect('/admin-dashboard')

  // Fetch initial data
  const [{ data: announcements }, { data: members }, { data: events }, { data: visitors }] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title, body, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('members')
      .select('id, full_name, phone, created_at')
      .eq('leader_id', user.id)
      .order('full_name', { ascending: true }),
    supabase
      .from('events')
      .select('id, title, description, event_date, created_at, profiles!created_by(full_name)')
      .order('event_date', { ascending: true }),
    supabase
      .from('visitors')
      .select('id, full_name, phone, visit_date, notes, status, created_at')
      .eq('leader_id', user.id)
      .order('visit_date', { ascending: false }),
  ])

  return (
    <LeaderDashboardClient
      profile={{ id: profile.id, full_name: profile.full_name, role: 'leader' }}
      initialAnnouncements={(announcements ?? []) as unknown as Parameters<typeof LeaderDashboardClient>[0]['initialAnnouncements']}
      initialMembers={(members ?? []) as Member[]}
      initialEvents={(events ?? []) as unknown as Parameters<typeof LeaderDashboardClient>[0]['initialEvents']}
      initialVisitors={(visitors ?? []) as Visitor[]}
    />
  )
}
