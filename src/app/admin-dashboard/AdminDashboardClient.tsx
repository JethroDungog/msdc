'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import AnnouncementCard from '@/components/AnnouncementCard'
import AnnouncementForm from '@/components/AnnouncementForm'
import EventCard from '@/components/EventCard'
import EventForm from '@/components/EventForm'
import type { ChurchEvent } from '@/lib/types'

interface Profile { id: string; full_name: string; role: 'admin' }

interface Announcement {
  id: string; title: string; body: string; created_at: string
  profiles?: { full_name: string } | null
}

interface Leader {
  id: string; full_name: string; role: string; created_at: string; memberCount: number
}

type AdminTab = 'announcements' | 'leaders' | 'events'

interface Props {
  profile: Profile
  initialAnnouncements: Announcement[]
  initialLeaders: Leader[]
  initialEvents: ChurchEvent[]
}

export default function AdminDashboardClient({ profile, initialAnnouncements, initialLeaders, initialEvents }: Props) {
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders)
  const [events, setEvents] = useState<ChurchEvent[]>(initialEvents)
  const [activeTab, setActiveTab] = useState<AdminTab>('announcements')

  // Add Leader form
  const [showLeaderForm, setShowLeaderForm] = useState(false)
  const [newLeaderName, setNewLeaderName] = useState('')
  const [newLeaderEmail, setNewLeaderEmail] = useState('')
  const [newLeaderPassword, setNewLeaderPassword] = useState('')
  const [addingLeader, setAddingLeader] = useState(false)
  const [leaderError, setLeaderError] = useState<string | null>(null)
  const [leaderSuccess, setLeaderSuccess] = useState(false)

  const refreshAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from('announcements')
      .select('id, title, body, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
    if (data) setAnnouncements(data as unknown as Announcement[])
  }, [])

  const refreshEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title, description, event_date, created_at, profiles!created_by(full_name)')
      .order('event_date', { ascending: true })
    if (data) setEvents(data as unknown as ChurchEvent[])
  }, [])

  const refreshLeaders = useCallback(async () => {
    const [{ data: ls }, { data: mc }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, created_at').eq('role', 'leader').order('full_name'),
      supabase.from('members').select('leader_id'),
    ])
    const countMap: Record<string, number> = {}
    mc?.forEach((m) => { countMap[m.leader_id] = (countMap[m.leader_id] ?? 0) + 1 })
    if (ls) setLeaders(ls.map((l) => ({ ...l, memberCount: countMap[l.id] ?? 0 })))
  }, [])

  async function handleDeleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleAddLeader(e: React.FormEvent) {
    e.preventDefault()
    setAddingLeader(true)
    setLeaderError(null)
    setLeaderSuccess(false)

    // Create user via Supabase Admin (requires service role key — we use signUp here for now)
    // In production: use Supabase Admin API from a secure server action
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newLeaderEmail.trim(),
      password: newLeaderPassword,
      options: {
        data: { full_name: newLeaderName.trim(), role: 'leader' },
      },
    })

    if (authError) {
      setLeaderError(authError.message)
      setAddingLeader(false)
      return
    }

    if (authData.user) {
      // The trigger handles profile creation, but update role explicitly
      await supabase
        .from('profiles')
        .upsert({ id: authData.user.id, full_name: newLeaderName.trim(), role: 'leader' })
    }

    setAddingLeader(false)
    setLeaderSuccess(true)
    setNewLeaderName(''); setNewLeaderEmail(''); setNewLeaderPassword('')
    setShowLeaderForm(false)
    setTimeout(() => setLeaderSuccess(false), 4000)
    await refreshLeaders()
  }

  async function handleRemoveLeader(id: string, name: string) {
    if (!confirm(`Remove leader "${name}"? Their members will also be removed.`)) return
    await supabase.from('profiles').delete().eq('id', id)
    setLeaders((prev) => prev.filter((l) => l.id !== id))
  }

  const totalMembers = leaders.reduce((sum, l) => sum + l.memberCount, 0)

  return (
    <div className="min-h-screen bg-msdc-charcoal-light dark:bg-msdc-charcoal">
      <Navbar userFullName={profile.full_name} userRole="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Admin Header ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #8B0000 0%, #C0392B 50%, #2D0000 100%)' }}>
          {/* Backdrop faint overlay */}
          <div className="absolute inset-0 opacity-10">
            <Image src="/backdrop.jpg" alt="" fill className="object-cover object-center" />
          </div>
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <Image src="/logo.jpg" alt="MSDC" fill className="object-cover rounded-full ring-2 ring-white/30" />
            </div>
            <div>
              <p className="text-red-200 text-xs uppercase tracking-widest font-medium">Admin Panel</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                Welcome, Pastor {profile.full_name}
              </h1>
              <p className="text-red-200/70 text-sm mt-1">My Soul Desire Church — Ministry Management</p>
            </div>
            {/* Quick stats */}
            <div className="sm:ml-auto flex gap-4 text-center">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-white">{leaders.length}</p>
                <p className="text-xs text-red-200">Leaders</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-white">{totalMembers}</p>
                <p className="text-xs text-red-200">Members</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-white">{announcements.length}</p>
                <p className="text-xs text-red-200">Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ────────────────────────────── */}
        <div className="flex gap-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-1">
          {([
            {
              key: 'announcements', label: 'Announcements', count: announcements.length,
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            },
            {
              key: 'events', label: 'Calendar', count: events.length,
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            {
              key: 'leaders', label: 'Leaders', count: leaders.length,
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            },
          ] as { key: AdminTab; label: string; count: number; icon: React.ReactNode }[]).map((tab) => (
            <button
              key={tab.key}
              id={`admin-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-red-500 to-red-700 dark:from-red-700 dark:to-red-900 text-white shadow-lg shadow-red-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── ANNOUNCEMENTS TAB ─────────────────────────── */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
            {/* Create Form */}
            <div className="lg:col-span-1">
              <div className="section-card sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-red-500 to-red-800" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Post Announcement</h2>
                </div>
                <AnnouncementForm userId={profile.id} onCreated={refreshAnnouncements} />
              </div>
            </div>

            {/* Announcement List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">All Announcements</h2>
                <span className="text-xs text-gray-500">{announcements.length} total</span>
              </div>

              {announcements.length === 0 ? (
                <div className="section-card py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No announcements yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Create your first post using the form</p>
                </div>
              ) : (
                announcements.map((ann, i) => (
                  <div key={ann.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <AnnouncementCard
                      announcement={ann}
                      isAdmin={true}
                      onDelete={handleDeleteAnnouncement}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ─────────────────────────── */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
            {/* Create Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <EventForm onEventAdded={refreshEvents} />
              </div>
            </div>

            {/* Events List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                <span className="text-xs text-gray-500">{events.length} total</span>
              </div>

              {events.length === 0 ? (
                <div className="section-card py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No events scheduled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Schedule an event using the form</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {events.map((event, i) => (
                    <div key={event.id} style={{ animationDelay: `${i * 60}ms` }}>
                      <EventCard
                        event={event}
                        isAdmin={true}
                        onDelete={handleDeleteEvent}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LEADERS TAB ───────────────────────────────── */}
        {activeTab === 'leaders' && (
          <div className="animate-fade-in space-y-4">
            {/* Add Leader button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Church Leaders</h2>
                <p className="text-xs text-gray-500 mt-0.5">{leaders.length} leader{leaders.length !== 1 ? 's' : ''} registered</p>
              </div>
              <button
                id="add-leader-btn"
                onClick={() => { setShowLeaderForm(!showLeaderForm); setLeaderError(null) }}
                className="btn-red text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Leader
              </button>
            </div>

            {/* Add Leader Form */}
            {showLeaderForm && (
              <form id="add-leader-form" onSubmit={handleAddLeader}
                className="section-card border-red-300 dark:border-red-600/20 space-y-3 animate-fade-in">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">New Leader Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Full Name *</label>
                    <input
                      id="leader-name"
                      type="text"
                      value={newLeaderName}
                      onChange={(e) => setNewLeaderName(e.target.value)}
                      placeholder="Leader Full Name"
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                    <input
                      id="leader-email"
                      type="email"
                      value={newLeaderEmail}
                      onChange={(e) => setNewLeaderEmail(e.target.value)}
                      placeholder="leader@msdc.church"
                      required
                      className="input-field"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Temporary Password *</label>
                    <input
                      id="leader-password"
                      type="password"
                      value={newLeaderPassword}
                      onChange={(e) => setNewLeaderPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      className="input-field"
                    />
                  </div>
                </div>
                {leaderError && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600/30 rounded px-3 py-2">{leaderError}</p>
                )}
                <div className="flex gap-2">
                  <button id="save-leader-btn" type="submit" disabled={addingLeader} className="btn-red text-sm">
                    {addingLeader ? 'Creating...' : 'Create Leader'}
                  </button>
                  <button type="button" onClick={() => setShowLeaderForm(false)} className="btn-ghost text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Success message */}
            {leaderSuccess && (
              <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-lg px-4 py-3 flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Leader account created! They can now sign in with their credentials.
              </p>
            )}

            {/* Leaders Grid */}
            {leaders.length === 0 ? (
              <div className="section-card py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No leaders yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Add your first leader above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {leaders.map((leader, i) => (
                  <div
                    key={leader.id}
                    className="section-card animate-fade-in hover:border-black/15 dark:hover:border-white/15 transition-all group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-base font-bold text-white shrink-0">
                        {leader.full_name.charAt(0).toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{leader.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-600/20">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Leader
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {leader.memberCount} member{leader.memberCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      id={`remove-leader-${leader.id}`}
                      onClick={() => handleRemoveLeader(leader.id, leader.full_name)}
                      className="btn-danger w-full mt-3 justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                      Remove Leader
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
