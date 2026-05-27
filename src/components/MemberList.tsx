'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Member {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  created_at: string
}

interface MemberListProps {
  leaderId: string
  members: Member[]
  onMembersChanged: () => void
}

export default function MemberList({ leaderId, members, onMembersChanged }: MemberListProps) {
  const supabase = createClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)

    const { error: err } = await supabase.from('members').insert({
      leader_id: leaderId,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
    })

    setAdding(false)
    if (err) { setError(err.message); return }

    setFullName(''); setPhone(''); setEmail('')
    setShowAddForm(false)
    onMembersChanged()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this member from your list?')) return
    setDeletingId(id)
    await supabase.from('members').delete().eq('id', id)
    setDeletingId(null)
    onMembersChanged()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingMember) return
    setAdding(true)
    setError(null)

    const { error: err } = await supabase
      .from('members')
      .update({
        full_name: editingMember.full_name.trim(),
        phone: editingMember.phone?.trim() || null,
        email: editingMember.email?.trim() || null,
      })
      .eq('id', editingMember.id)

    setAdding(false)
    if (err) { setError(err.message); return }
    setEditingMember(null)
    onMembersChanged()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">My Members</h3>
          <p className="text-xs text-gray-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''} assigned</p>
        </div>
        <button
          id="add-member-btn"
          onClick={() => { setShowAddForm(!showAddForm); setError(null) }}
          className="btn-red text-sm px-3 py-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} id="add-member-form"
          className="section-card border-red-600/20 space-y-3 animate-fade-in">
          <h4 className="text-sm font-semibold text-red-400">New Member</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
              <input
                id="member-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan dela Cruz"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phone</label>
              <input
                id="member-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@email.com"
                className="input-field"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button id="save-member-btn" type="submit" disabled={adding} className="btn-red text-sm">
              {adding ? 'Saving...' : 'Save Member'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit Form */}
      {editingMember && (
        <form onSubmit={handleEdit} id="edit-member-form"
          className="section-card border-yellow-600/20 space-y-3 animate-fade-in">
          <h4 className="text-sm font-semibold text-yellow-400">Edit Member</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={editingMember.full_name}
                onChange={(e) => setEditingMember({ ...editingMember, full_name: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phone</label>
              <input
                type="tel"
                value={editingMember.phone ?? ''}
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={editingMember.email ?? ''}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={adding} className="btn-red text-sm">
              {adding ? 'Updating...' : 'Update Member'}
            </button>
            <button type="button" onClick={() => setEditingMember(null)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Members List */}
      {members.length === 0 ? (
        <div className="section-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No members yet</p>
          <p className="text-xs text-gray-600 mt-1">Click "Add Member" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member, i) => (
            <div
              key={member.id}
              className="section-card flex items-center gap-3 py-3 px-4 hover:border-white/15 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {member.full_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{member.full_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {member.phone && (
                    <span className="text-xs text-gray-500 truncate">{member.phone}</span>
                  )}
                  {member.email && (
                    <span className="text-xs text-gray-600 truncate hidden sm:block">{member.email}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  id={`edit-member-${member.id}`}
                  onClick={() => { setEditingMember(member); setShowAddForm(false) }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
                  title="Edit member"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  id={`delete-member-${member.id}`}
                  onClick={() => handleDelete(member.id)}
                  disabled={deletingId === member.id}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Remove member"
                >
                  {deletingId === member.id ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
