'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import AnnouncementCard from '@/components/AnnouncementCard'
import MemberList from '@/components/MemberList'
import AttendanceTracker from '@/components/AttendanceTracker'
import AttendanceHistory from '@/components/AttendanceHistory'
import EventCard from '@/components/EventCard'
import type { Announcement, Member, ChurchEvent } from '@/lib/types'

interface Profile {
  id: string
  full_name: string
  role: 'leader'
}

type Tab = 'members' | 'attendance' | 'history'

interface LeaderDashboardClientProps {
  profile: Profile
  initialAnnouncements: Announcement[]
  initialMembers: Member[]
  initialEvents: ChurchEvent[]
}

export default function LeaderDashboardClient({
  profile,
  initialAnnouncements,
  initialMembers,
  initialEvents,
}: LeaderDashboardClientProps) {
  const supabase = createClient()
  const [announcements] = useState<Announcement[]>(initialAnnouncements)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [events] = useState<ChurchEvent[]>(initialEvents)
  const [activeTab, setActiveTab] = useState<Tab>('members')
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshMembers = useCallback(async () => {
    const { data } = await supabase
      .from('members')
      .select('id, full_name, phone, created_at')
      .eq('leader_id', profile.id)
      .order('full_name', { ascending: true })
    if (data) setMembers(data as Member[])
    setRefreshKey((k) => k + 1)
  }, [profile.id])

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'members',
      label: 'My Members',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'attendance',
      label: 'Take Attendance',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      key: 'history',
      label: 'History',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-msdc-charcoal-light dark:bg-msdc-charcoal">
      <Navbar userFullName={profile.full_name} userRole="leader" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Welcome Header ─────────────────────────────── */}
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, <span className="text-gradient-red">{profile.full_name}</span> 👋
            </h1>
            <p className="text-sm text-gray-500">Leader · My Soul Desire Church</p>
          </div>
        </div>

        {/* ── Announcements Section ──────────────────────── */}
        <section id="announcements-section">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-red-500 to-red-800" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Church Announcements</h2>
            <span className="text-xs bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {announcements.length}
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="section-card py-8 text-center text-gray-500 text-sm">
              No announcements yet. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.map((ann, i) => (
                <div key={ann.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <AnnouncementCard announcement={ann} isAdmin={false} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Events Section ──────────────────────── */}
        <section id="events-section">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-500 to-yellow-800" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
            <span className="text-xs bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {events.length}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="section-card py-8 text-center text-gray-500 text-sm">
              No upcoming events scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((event, i) => (
                <div key={event.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <EventCard event={event} isAdmin={false} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Main Feature Panel ─────────────────────────── */}
        <section id="main-panel">
          {/* Tab bar */}
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-1 mb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-red-500 to-red-700 dark:from-red-700 dark:to-red-900 text-white shadow-lg shadow-red-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="section-card">
            {activeTab === 'members' && (
              <MemberList
                leaderId={profile.id}
                members={members}
                onMembersChanged={refreshMembers}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTracker
                key={`tracker-${refreshKey}`}
                leaderId={profile.id}
                members={members}
              />
            )}

            {activeTab === 'history' && (
              <AttendanceHistory leaderId={profile.id} />
            )}
          </div>
        </section>

        {/* ── Stats quick view ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
          <div className="section-card text-center py-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{members.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Members</p>
          </div>
          <div className="section-card text-center py-4">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{announcements.length}</p>
            <p className="text-xs text-gray-500 mt-1">Announcements</p>
          </div>
          <div className="section-card text-center py-4 col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {new Date().toLocaleDateString('en-PH', { weekday: 'short' })}
            </p>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </div>
        </div>
      </div>
    </div>
  )
}
