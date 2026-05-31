'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import type { Visitor } from '@/lib/types'

interface AttendanceHistoryProps {
  leaderId: string
  visitors: Visitor[]
}

interface SessionSummary {
  session_date: string
  service_type: string
  memberPresent: number
  memberAbsent: number
  visitorPresent: number
}

interface MemberRecord {
  member_id: string
  present: boolean
  name: string
  type: 'member' | 'visitor'
}

export default function AttendanceHistory({ leaderId, visitors }: AttendanceHistoryProps) {
  const supabase = createClient()

  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [sessionDetails, setSessionDetails] = useState<MemberRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)

    // Fetch member attendance + visitor attendance in parallel
    const [{ data: memberData }, { data: visitorData }] = await Promise.all([
      supabase
        .from('attendance_records')
        .select('session_date, service_type, present')
        .eq('leader_id', leaderId)
        .order('session_date', { ascending: false }),
      supabase
        .from('visitor_attendance_records')
        .select('session_date, service_type, present')
        .eq('leader_id', leaderId)
        .order('session_date', { ascending: false }),
    ])

    const grouped: Record<string, { memberPresent: number; memberAbsent: number; visitorPresent: number; date: string; service: string }> = {}

    memberData?.forEach((rec) => {
      const type = rec.service_type || 'Sunday Service'
      const key = `${rec.session_date}_${type}`
      if (!grouped[key]) {
        grouped[key] = { memberPresent: 0, memberAbsent: 0, visitorPresent: 0, date: rec.session_date, service: type }
      }
      if (rec.present) grouped[key].memberPresent++
      else grouped[key].memberAbsent++
    })

    visitorData?.forEach((rec) => {
      const type = rec.service_type || 'Sunday Service'
      const key = `${rec.session_date}_${type}`
      if (!grouped[key]) {
        grouped[key] = { memberPresent: 0, memberAbsent: 0, visitorPresent: 0, date: rec.session_date, service: type }
      }
      if (rec.present) grouped[key].visitorPresent++
    })

    const result = Object.values(grouped).map((stats) => ({
      session_date: stats.date,
      service_type: stats.service,
      memberPresent: stats.memberPresent,
      memberAbsent: stats.memberAbsent,
      visitorPresent: stats.visitorPresent,
    }))
    result.sort((a, b) => {
      if (a.session_date === b.session_date) {
        return a.service_type.localeCompare(b.service_type)
      }
      return new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    })

    setSessions(result)
    setLoading(false)
  }

  async function loadSessionDetails(date: string, service: string) {
    setSelectedDate(date)
    setSelectedService(service)
    setLoadingDetails(true)

    // Fetch member records + visitor records in parallel
    const [{ data: memberData }, { data: visitorData }] = await Promise.all([
      supabase
        .from('attendance_records')
        .select('member_id, present, members(full_name)')
        .eq('leader_id', leaderId)
        .eq('session_date', date)
        .eq('service_type', service),
      supabase
        .from('visitor_attendance_records')
        .select('visitor_id, present')
        .eq('leader_id', leaderId)
        .eq('session_date', date)
        .eq('service_type', service),
    ])

    const combined: MemberRecord[] = [
      ...(memberData ?? []).map((r: any) => ({
        member_id: r.member_id,
        present: r.present,
        name: r.members?.full_name ?? 'Unknown',
        type: 'member' as const,
      })),
      ...(visitorData ?? []).map((r: any) => {
        const visitor = visitors.find((v) => v.id === r.visitor_id)
        return {
          member_id: r.visitor_id,
          present: r.present,
          name: visitor?.full_name ?? 'Unknown Visitor',
          type: 'visitor' as const,
        }
      }),
    ]

    setSessionDetails(combined)
    setLoadingDetails(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="section-card flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">No attendance history yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Save your first session above to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by date or service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/40 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {sessions
          .filter((s) => {
            const q = searchQuery.toLowerCase()
            const dateStr = format(parseISO(s.session_date), 'MMMM d yyyy MMM yyyy-MM-dd').toLowerCase()
            return s.service_type.toLowerCase().includes(q) || dateStr.includes(q)
          })
          .map((session, i) => {
          const memberTotal = session.memberPresent + session.memberAbsent
          const pct = memberTotal > 0 ? Math.round((session.memberPresent / memberTotal) * 100) : 0
          const isSelected = selectedDate === session.session_date && selectedService === session.service_type

          return (
            <div key={`${session.session_date}_${session.service_type}`} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                id={`history-session-${session.session_date}-${session.service_type.replace(/\s+/g, '')}`}
                onClick={() =>
                  isSelected
                    ? setSelectedDate(null)
                    : loadSessionDetails(session.session_date, session.service_type)
                }
                className={`w-full bg-white dark:bg-black/20 border-2 rounded-xl p-4 flex items-center gap-4 text-left transition-all hover:border-black/20 dark:hover:border-white/20 shadow-sm ${
                  isSelected ? 'border-red-400 dark:border-red-600/60 bg-red-50/50 dark:bg-red-900/10' : 'border-black/5 dark:border-white/5'
                }`}
              >
                {/* Date */}
                <div className="shrink-0 text-center w-16">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                    {format(parseISO(session.session_date), 'd')}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mt-1">
                    {format(parseISO(session.session_date), 'MMM')}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {format(parseISO(session.session_date), 'yyyy')}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-14 bg-gray-200 dark:bg-gray-700 shrink-0" />

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-bold text-base mb-1.5">{session.service_type}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
                      <span className="font-bold text-gray-900 dark:text-white">{session.memberPresent}</span> present
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
                      <span className="font-bold text-gray-900 dark:text-white">{session.memberAbsent}</span> absent
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
                      <span className="font-bold text-gray-900 dark:text-white">{session.visitorPresent}</span> visitor{session.visitorPresent !== 1 ? 's' : ''}
                    </p>
                    
                    <span className={`ml-auto text-sm font-extrabold ${pct >= 80 ? 'text-green-600 dark:text-green-400' : pct >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? '#27AE60' : pct >= 50 ? '#F39C12' : '#E74C3C'
                      }}
                    />
                  </div>
                </div>

                {/* Chevron */}
                <div className="shrink-0 bg-gray-50 dark:bg-gray-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors">
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 transition-transform ${isSelected ? 'rotate-180 text-red-500' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {isSelected && (
                <div className="mt-1 section-card border-red-200 dark:border-red-600/20 animate-fade-in">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wide">
                    {format(parseISO(session.session_date), 'MMMM d, yyyy')} • {session.service_type}
                  </p>
                  {loadingDetails ? (
                    <div className="flex justify-center py-4">
                      <svg className="animate-spin w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sessionDetails
                        .sort((a, b) => (b.present ? 1 : 0) - (a.present ? 1 : 0))
                        .map((rec) => (
                          <div
                            key={rec.member_id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium shadow-sm border ${
                              rec.present
                                ? rec.type === 'visitor'
                                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900/50'
                                  : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-900/50'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
                              rec.present
                                ? rec.type === 'visitor' ? 'bg-amber-500' : 'bg-green-500'
                                : 'bg-gray-400 dark:bg-gray-500'
                            }`} />
                            <span className="truncate flex-1">{rec.name}</span>
                            {rec.type === 'visitor' && (
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0 uppercase tracking-wider">
                                Visitor
                              </span>
                            )}
                            <span className={`text-lg font-bold shrink-0 ${rec.present ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                              {rec.present ? '✓' : '✗'}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {sessions.length > 0 && sessions.filter((s) => {
            const q = searchQuery.toLowerCase()
            const dateStr = format(parseISO(s.session_date), 'MMMM d yyyy MMM yyyy-MM-dd').toLowerCase()
            return s.service_type.toLowerCase().includes(q) || dateStr.includes(q)
          }).length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No history found matching "{searchQuery}"
          </div>
        )}
      </div>

    </div>
  )
}

