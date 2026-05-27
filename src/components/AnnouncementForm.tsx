'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AnnouncementFormProps {
  userId: string
  onCreated: () => void
}

export default function AnnouncementForm({ userId, onCreated }: AnnouncementFormProps) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error: insertError } = await supabase.from('announcements').insert({
      title: title.trim(),
      body: body.trim(),
      created_by: userId,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setTitle('')
    setBody('')
    setSuccess(true)
    onCreated()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form id="announcement-form" onSubmit={handleSubmit} className="space-y-3">
      {/* Title */}
      <div>
        <label htmlFor="ann-title" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Announcement Title
        </label>
        <input
          id="ann-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sunday Service Update"
          required
          maxLength={120}
          className="input-field"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="ann-body" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Message
        </label>
        <textarea
          id="ann-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your announcement here..."
          required
          rows={4}
          className="input-field resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Success */}
      {success && (
        <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-lg px-3 py-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Announcement posted successfully!
        </p>
      )}

      {/* Submit */}
      <button
        id="post-announcement-btn"
        type="submit"
        disabled={loading || !title.trim() || !body.trim()}
        className="btn-red w-full justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Posting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Post Announcement
          </>
        )}
      </button>
    </form>
  )
}
