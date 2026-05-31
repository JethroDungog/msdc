'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import MemberList from '@/components/MemberList'
import AttendanceHistory from '@/components/AttendanceHistory'
import type { Visitor } from '@/lib/types'

interface Member {
  id: string
  full_name: string
  phone: string | null
  created_at: string
}

interface Leader {
  id: string
  full_name: string
  role: string
  created_at: string
  memberCount: number
}

interface AdminLeaderDetailViewProps {
  leader: Leader
  onClose: () => void
}

export default function AdminLeaderDetailView({ leader, onClose }: AdminLeaderDetailViewProps) {
  const supabase = createClient()

  const [members, setMembers] = useState<Member[]>([])
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [activeTab, setActiveTab] = useState<'members' | 'attendance'>('members')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [leader.id])

  async function fetchData() {
    setLoading(true)
    await Promise.all([fetchMembers(), fetchVisitors()])
    setLoading(false)
  }

  async function fetchMembers() {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('leader_id', leader.id)
      .order('full_name')
    if (data) setMembers(data as Member[])
  }

  async function fetchVisitors() {
    const { data } = await supabase
      .from('visitors')
      .select('*')
      .eq('leader_id', leader.id)
      .order('visit_date', { ascending: false })
    if (data) setVisitors(data as Visitor[])
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between bg-white dark:bg-black/20 p-4 rounded-xl border border-black/[0.07] dark:border-white/[0.07]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Back to Leaders"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {leader.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white leading-tight">{leader.full_name}</h2>
            <p className="text-xs text-gray-500">Leader Detail View</p>
          </div>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
            activeTab === 'members'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Members & Visitors
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
            activeTab === 'attendance'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Attendance History
        </button>
      </div>

      {/* Content */}
      <div className="section-card border-t-4 border-t-red-500 dark:border-t-red-700">
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {activeTab === 'members' && (
              <MemberList
                leaderId={leader.id}
                members={members}
                visitors={visitors}
                onMembersChanged={fetchMembers}
                onVisitorsChanged={fetchVisitors}
                isReadOnly={true}
              />
            )}
            {activeTab === 'attendance' && (
              <AttendanceHistory leaderId={leader.id} visitors={visitors} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
