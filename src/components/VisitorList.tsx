'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Visitor, Member } from '@/lib/types'
import { format, parseISO } from 'date-fns'

interface VisitorListProps {
  leaderId: string
  visitors: Visitor[]
  onVisitorsChanged: () => void
  onMembersChanged: () => void
  isReadOnly?: boolean
}

export default function VisitorList({
  leaderId,
  visitors,
  onVisitorsChanged,
  onMembersChanged,
  isReadOnly = false,
}: VisitorListProps) {
  const supabase = createClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null)

  function resetForm() {
    setFullName('')
    setPhone('')
    setVisitDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setError(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)

    const { error: err } = await supabase.from('visitors').insert({
      leader_id: leaderId,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      visit_date: visitDate,
      notes: notes.trim() || null,
      status: 'visitor',
    })

    setAdding(false)
    if (err) { setError(err.message); return }

    resetForm()
    setShowAddForm(false)
    onVisitorsChanged()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingVisitor) return
    setAdding(true)
    setError(null)

    const { error: err } = await supabase
      .from('visitors')
      .update({
        full_name: editingVisitor.full_name.trim(),
        phone: editingVisitor.phone?.trim() || null,
        visit_date: editingVisitor.visit_date,
        notes: editingVisitor.notes?.trim() || null,
      })
      .eq('id', editingVisitor.id)

    setAdding(false)
    if (err) { setError(err.message); return }
    setEditingVisitor(null)
    onVisitorsChanged()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this visitor from your list?')) return
    setDeletingId(id)
    await supabase.from('visitors').delete().eq('id', id)
    setDeletingId(null)
    onVisitorsChanged()
  }

  async function handleConvert(visitor: Visitor) {
    if (!confirm(`Convert ${visitor.full_name} to a full member?`)) return
    setConvertingId(visitor.id)

    // Insert into members table
    const { error: memberErr } = await supabase.from('members').insert({
      leader_id: leaderId,
      full_name: visitor.full_name,
      phone: visitor.phone,
    })

    if (memberErr) {
      alert('Failed to add as member: ' + memberErr.message)
      setConvertingId(null)
      return
    }

    // Mark visitor as converted
    await supabase
      .from('visitors')
      .update({ status: 'converted' })
      .eq('id', visitor.id)

    setConvertingId(null)
    onVisitorsChanged()
    onMembersChanged()
  }

  const activeVisitors = visitors.filter((v) => v.status === 'visitor')
  const convertedVisitors = visitors.filter((v) => v.status === 'converted')

  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-black/[0.06] dark:border-white/[0.06]">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>My Visitors</span>
            <span className="text-xs font-normal bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {activeVisitors.length} active
            </span>
            {convertedVisitors.length > 0 && (
              <span className="text-xs font-normal bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                {convertedVisitors.length} converted
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Track visitors and convert them to members
          </p>
        </div>
        {!isReadOnly && (
          <button
            id="add-visitor-btn"
            onClick={() => { setShowAddForm(!showAddForm); setError(null) }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
              bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700
              text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-900/30
              active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Visitor
          </button>
        )}
      </div>

      {/* Add Visitor Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          id="add-visitor-form"
          className="section-card border-amber-300 dark:border-amber-600/20 space-y-3 animate-fade-in"
        >
          <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400">New Visitor</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Full Name *</label>
              <input
                id="visitor-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan dela Cruz"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Phone</label>
              <input
                id="visitor-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Visit Date *</label>
              <input
                id="visitor-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Notes</label>
              <input
                id="visitor-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How they heard about us, etc."
                className="input-field"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              id="save-visitor-btn"
              type="submit"
              disabled={adding}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700
                text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Saving...' : 'Save Visitor'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); resetForm() }}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit Visitor Form */}
      {editingVisitor && (
        <form
          onSubmit={handleEdit}
          id="edit-visitor-form"
          className="section-card border-yellow-300 dark:border-yellow-600/20 space-y-3 animate-fade-in"
        >
          <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Edit Visitor</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={editingVisitor.full_name}
                onChange={(e) => setEditingVisitor({ ...editingVisitor, full_name: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Phone</label>
              <input
                type="tel"
                value={editingVisitor.phone ?? ''}
                onChange={(e) => setEditingVisitor({ ...editingVisitor, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Visit Date *</label>
              <input
                type="date"
                value={editingVisitor.visit_date}
                onChange={(e) => setEditingVisitor({ ...editingVisitor, visit_date: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Notes</label>
              <input
                type="text"
                value={editingVisitor.notes ?? ''}
                onChange={(e) => setEditingVisitor({ ...editingVisitor, notes: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={adding} className="btn-red text-sm">
              {adding ? 'Updating...' : 'Update Visitor'}
            </button>
            <button type="button" onClick={() => setEditingVisitor(null)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Active Visitors List */}
      {visitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl
          bg-amber-50 dark:bg-amber-900/10 border border-dashed border-amber-200 dark:border-amber-800/40">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">No visitors yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Click "Add Visitor" to log one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Active visitors first */}
          {activeVisitors.map((visitor, i) => (
            <div
              key={visitor.id}
              className="flex items-center gap-3 py-3 px-4 rounded-xl
                bg-white dark:bg-white/[0.03] border border-black/[0.07] dark:border-white/[0.07]
                hover:border-amber-200 dark:hover:border-amber-800/50 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {visitor.full_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{visitor.full_name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Visited {format(parseISO(visitor.visit_date), 'MMM d, yyyy')}
                  </span>
                  {visitor.phone && (
                    <span className="text-xs text-gray-500 truncate">{visitor.phone}</span>
                  )}
                  {visitor.notes && (
                    <span className="text-xs text-gray-400 italic truncate">{visitor.notes}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {!isReadOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  {/* Convert to Member */}
                  <button
                    id={`convert-visitor-${visitor.id}`}
                    onClick={() => handleConvert(visitor)}
                    disabled={convertingId === visitor.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
                      text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20
                      hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800/50
                      transition-all disabled:opacity-50"
                    title="Convert to member"
                  >
                    {convertingId === visitor.id ? (
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">Make Member</span>
                  </button>

                  {/* Edit */}
                  <button
                    id={`edit-visitor-${visitor.id}`}
                    onClick={() => { setEditingVisitor(visitor); setShowAddForm(false) }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
                    title="Edit visitor"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    id={`delete-visitor-${visitor.id}`}
                    onClick={() => handleDelete(visitor.id)}
                    disabled={deletingId === visitor.id}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Remove visitor"
                  >
                    {deletingId === visitor.id ? (
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
              )}
            </div>
          ))}

          {/* Converted visitors (collapsed appearance) */}
          {convertedVisitors.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-2">
                Converted to Members
              </p>
              <div className="space-y-1.5">
                {convertedVisitors.map((visitor) => (
                  <div
                    key={visitor.id}
                    className="flex items-center gap-3 py-2 px-4 rounded-xl
                      bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20
                      opacity-75"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {visitor.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm truncate">{visitor.full_name}</p>
                      <p className="text-xs text-gray-500">
                        Visited {format(parseISO(visitor.visit_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Member
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
