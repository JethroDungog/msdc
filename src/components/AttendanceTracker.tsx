'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Visitor } from '@/lib/types'

interface Member {
  id: string
  full_name: string
}

interface AttendanceTrackerProps {
  leaderId: string
  members: Member[]
  visitors: Visitor[]
}

type AttendanceMap = Record<string, boolean>

export default function AttendanceTracker({ leaderId, members, visitors }: AttendanceTrackerProps) {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDisplay = format(new Date(), 'EEEE, MMMM d, yyyy')

  const activeVisitors = visitors.filter((v) => v.status === 'visitor')

  const [attendance, setAttendance] = useState<AttendanceMap>(() =>
    Object.fromEntries(members.map((m) => [m.id, false]))
  )
  const [visitorAttendance, setVisitorAttendance] = useState<AttendanceMap>(() =>
    Object.fromEntries(activeVisitors.map((v) => [v.id, false]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionDate, setSessionDate] = useState(today)
  const [serviceType, setServiceType] = useState('Sunday Service')

  // Re-initialize when members change
  useEffect(() => {
    setAttendance(Object.fromEntries(members.map((m) => [m.id, attendance[m.id] ?? false])))
  }, [members])

  // Re-initialize when visitors change
  useEffect(() => {
    setVisitorAttendance(Object.fromEntries(activeVisitors.map((v) => [v.id, visitorAttendance[v.id] ?? false])))
  }, [visitors])

  // Load existing attendance for the selected date and service type
  useEffect(() => {
    if (members.length === 0) return
    loadAttendanceForDate(sessionDate, serviceType)
  }, [sessionDate, serviceType, members])

  async function loadAttendanceForDate(date: string, type: string) {
    const { data } = await supabase
      .from('attendance_records')
      .select('member_id, present')
      .eq('leader_id', leaderId)
      .eq('session_date', date)
      .eq('service_type', type)

    if (data && data.length > 0) {
      const loaded: AttendanceMap = Object.fromEntries(members.map((m) => [m.id, false]))
      data.forEach((rec) => { loaded[rec.member_id] = rec.present })
      setAttendance(loaded)
    } else {
      setAttendance(Object.fromEntries(members.map((m) => [m.id, false])))
    }
  }

  function toggle(memberId: string) {
    setSaved(false)
    setAttendance((prev) => ({ ...prev, [memberId]: !prev[memberId] }))
  }

  function toggleVisitor(visitorId: string) {
    setSaved(false)
    setVisitorAttendance((prev) => ({ ...prev, [visitorId]: !prev[visitorId] }))
  }

  function markAll(present: boolean) {
    setSaved(false)
    setAttendance(Object.fromEntries(members.map((m) => [m.id, present])))
  }

  async function handleSave() {
    if (members.length === 0 && activeVisitors.length === 0) return
    setSaving(true)
    setError(null)
    setSaved(false)

    // Upsert member attendance records
    if (members.length > 0) {
      const memberRecords = members.map((m) => ({
        member_id: m.id,
        leader_id: leaderId,
        session_date: sessionDate,
        service_type: serviceType,
        present: attendance[m.id] ?? false,
      }))

      const { error: upsertError } = await supabase
        .from('attendance_records')
        .upsert(memberRecords, { onConflict: 'member_id,session_date,service_type' })

      if (upsertError) {
        setError(upsertError.message)
        setSaving(false)
        return
      }
    }

    // Upsert visitor attendance records
    if (activeVisitors.length > 0) {
      const visitorRecords = activeVisitors.map((v) => ({
        visitor_id: v.id,
        leader_id: leaderId,
        session_date: sessionDate,
        service_type: serviceType,
        present: visitorAttendance[v.id] ?? false,
      }))

      const { error: visitorErr } = await supabase
        .from('visitor_attendance_records')
        .upsert(visitorRecords, { onConflict: 'visitor_id,session_date,service_type' })

      if (visitorErr) {
        setError(visitorErr.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  const presentCount = Object.values(attendance).filter(Boolean).length
  const totalCount = members.length
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  const visitorPresentCount = Object.values(visitorAttendance).filter(Boolean).length

  const canSave = members.length > 0 || activeVisitors.length > 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Tracker</h3>
          <p className="text-xs text-gray-500 mt-0.5">{todayDisplay}</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          {/* Service Type picker */}
          <div className="flex items-center gap-2">
            <select
              value={serviceType}
              onChange={(e) => { setServiceType(e.target.value); setSaved(false) }}
              className="input-field py-1.5 px-3 text-sm min-w-[150px]"
            >
              <option value="Sunday Service" className="bg-gray-900 text-white">Sunday Service</option>
              <option value="Midweek Service" className="bg-gray-900 text-white">Midweek Service</option>
              <option value="Dawnprayer Service" className="bg-gray-900 text-white">Dawnprayer Service</option>
              <option value="LG Meeting" className="bg-gray-900 text-white">LG Meeting</option>
            </select>
          </div>
          
          {/* Date picker */}
          <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Session Date:</label>
          <input
            id="attendance-date"
            type="date"
            value={sessionDate}
            max={today}
            onChange={(e) => { setSessionDate(e.target.value); setSaved(false) }}
            className="input-field py-1.5 px-3 text-sm w-auto"
          />
        </div>
      </div>
    </div>

      {/* Stats bar — Members */}
      {totalCount > 0 && (
        <div className="section-card py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="text-gray-900 dark:text-white font-bold text-lg">{presentCount}</span>
              <span className="text-gray-500"> / {totalCount} members present</span>
            </span>
            <span className={`text-sm font-bold ${percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {percentage}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: percentage >= 80 ? '#27AE60' : percentage >= 50 ? '#F39C12' : '#E74C3C'
              }}
            />
          </div>
        </div>
      )}

      {/* Mark All buttons */}
      {totalCount > 0 && (
        <div className="flex gap-2">
          <button
            id="mark-all-present"
            onClick={() => markAll(true)}
            className="btn-ghost text-xs py-1.5 px-3 text-green-400 border-green-400/20 hover:bg-green-400/10"
          >
            ✓ Mark All Present
          </button>
          <button
            id="mark-all-absent"
            onClick={() => markAll(false)}
            className="btn-ghost text-xs py-1.5 px-3 text-gray-400"
          >
            ✗ Mark All Absent
          </button>
        </div>
      )}

      {/* Member toggles */}
      {members.length === 0 ? (
        <div className="section-card py-8 flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 dark:text-gray-400">Add members first to track attendance</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member, i) => {
            const isPresent = attendance[member.id] ?? false
            return (
              <button
                key={member.id}
                id={`toggle-${member.id}`}
                onClick={() => toggle(member.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left animate-fade-in ${
                  isPresent
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600/30 hover:border-green-300 dark:hover:border-green-500/50'
                    : 'bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/20'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
                aria-label={`${member.full_name} — ${isPresent ? 'Present' : 'Absent'}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  isPresent
                    ? 'bg-gradient-to-br from-green-500 to-green-700 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                }`}>
                  {member.full_name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate transition-colors ${isPresent ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {member.full_name}
                  </p>
                  <p className={`text-xs mt-0.5 transition-colors ${isPresent ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {isPresent ? '✓ Present' : '— Absent'}
                  </p>
                </div>

                {/* Toggle switch */}
                <div className={`attendance-toggle shrink-0 ${isPresent ? 'present' : 'absent'}`} />
              </button>
            )
          })}
        </div>
      )}

      {/* ── Newcomers / Visitors Section ─────────────────────── */}
      <div className="pt-4 mt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Newcomers / Visitors</h4>
          {activeVisitors.length > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {visitorPresentCount} / {activeVisitors.length} present
            </span>
          )}
        </div>

        {activeVisitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center rounded-xl
            bg-amber-50 dark:bg-amber-900/10 border border-dashed border-amber-200 dark:border-amber-800/40">
            <svg className="w-8 h-8 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No visitors added yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
              Add visitors in the "My Members" tab first
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeVisitors.map((visitor, i) => {
              const isPresent = visitorAttendance[visitor.id] ?? false
              return (
                <button
                  key={visitor.id}
                  id={`toggle-visitor-${visitor.id}`}
                  onClick={() => toggleVisitor(visitor.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left animate-fade-in ${
                    isPresent
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-600/30 hover:border-amber-300 dark:hover:border-amber-500/50'
                      : 'bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/20'
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  aria-label={`${visitor.full_name} — ${isPresent ? 'Present' : 'Absent'}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    isPresent
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      : 'bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {visitor.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + visitor badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm truncate transition-colors ${isPresent ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {visitor.full_name}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                        Visitor
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 transition-colors ${isPresent ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-600'}`}>
                      {isPresent ? '✓ Present' : '— Absent'}
                    </p>
                  </div>

                  {/* Toggle switch — amber when present */}
                  <div
                    className={`attendance-toggle shrink-0 ${isPresent ? 'present' : 'absent'}`}
                    style={isPresent ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' } : {}}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-600/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Save Button */}
      {canSave && (
        <button
          id="save-attendance-btn"
          onClick={handleSave}
          disabled={saving}
          className={`btn-red w-full justify-center py-3.5 text-base mt-2 ${!saved ? 'pulse-red' : ''}`}
        >
          {saving ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving Attendance...
            </>
          ) : saved ? (
            <>
              <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Attendance Saved!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Attendance
            </>
          )}
        </button>
      )}
    </div>
  )
}
