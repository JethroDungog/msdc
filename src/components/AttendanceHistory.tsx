'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'

interface AttendanceHistoryProps {
  leaderId: string
}

interface SessionSummary {
  session_date: string
  service_type: string
  total: number
  present: number
}

interface MemberRecord {
  member_id: string
  present: boolean
  members: { full_name: string } | null
}

export default function AttendanceHistory({ leaderId }: AttendanceHistoryProps) {
  const supabase = createClient()

  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [sessionDetails, setSessionDetails] = useState<MemberRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)
    const { data } = await supabase
      .from('attendance_records')
      .select('session_date, service_type, present')
      .eq('leader_id', leaderId)
      .order('session_date', { ascending: false })

    if (data) {
      // Group by date + service_type
      const grouped: Record<string, { total: number; present: number; date: string; service: string }> = {}
      data.forEach((rec) => {
        const type = rec.service_type || 'Sunday Service' // default fallback
        const key = `${rec.session_date}_${type}`
        if (!grouped[key]) {
          grouped[key] = { total: 0, present: 0, date: rec.session_date, service: type }
        }
        grouped[key].total++
        if (rec.present) grouped[key].present++
      })
      const result = Object.values(grouped).map((stats) => ({
        session_date: stats.date,
        service_type: stats.service,
        total: stats.total,
        present: stats.present,
      }))
      // Sort by date desc, then service name
      result.sort((a, b) => {
        if (a.session_date === b.session_date) {
          return a.service_type.localeCompare(b.service_type)
        }
        return new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
      })
      
      setSessions(result)
    }
    setLoading(false)
  }

  async function loadSessionDetails(date: string, service: string) {
    setSelectedDate(date)
    setSelectedService(service)
    setLoadingDetails(true)

    const { data } = await supabase
      .from('attendance_records')
      .select('member_id, present, members(full_name)')
      .eq('leader_id', leaderId)
      .eq('session_date', date)
      .eq('service_type', service)

    setSessionDetails((data as unknown as MemberRecord[]) ?? [])
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
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">No attendance history yet</p>
        <p className="text-xs text-gray-600 mt-1">Save your first session above to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {sessions.map((session, i) => {
          const pct = session.total > 0 ? Math.round((session.present / session.total) * 100) : 0
          const isSelected = selectedDate === session.session_date && selectedService === session.service_type

          return (
            <div key={`${session.session_date}_${session.service_type}`} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                id={`history-session-${session.session_date}-${session.service_type.replace(/\\s+/g, '')}`}
                onClick={() =>
                  isSelected
                    ? setSelectedDate(null)
                    : loadSessionDetails(session.session_date, session.service_type)
                }
                className={`w-full section-card flex items-center gap-4 text-left transition-all hover:border-white/15 ${
                  isSelected ? 'border-red-600/40 bg-red-900/10' : ''
                }`}
              >
                {/* Date */}
                <div className="shrink-0 text-center w-14">
                  <p className="text-xl font-bold text-white leading-none">
                    {format(parseISO(session.session_date), 'd')}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {format(parseISO(session.session_date), 'MMM')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {format(parseISO(session.session_date), 'yyyy')}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-white/10 shrink-0" />

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm mb-1">{session.service_type}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-300">
                      <span className="text-white font-semibold">{session.present}</span>
                      <span className="text-gray-500"> / {session.total} present</span>
                    </p>
                    <span className={`text-xs font-bold ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
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
                <svg
                  className={`w-4 h-4 text-gray-600 shrink-0 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isSelected && (
                <div className="mt-1 section-card border-red-600/20 animate-fade-in">
                  <p className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wide">
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
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                              rec.present
                                ? 'bg-green-900/20 text-green-300'
                                : 'bg-white/[0.03] text-gray-500'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${rec.present ? 'bg-green-400' : 'bg-gray-600'}`} />
                            <span className="truncate">{rec.members?.full_name ?? 'Unknown'}</span>
                            <span className="ml-auto text-xs shrink-0">
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
      </div>
    </div>
  )
}
