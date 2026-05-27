'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EventForm({ onEventAdded }: { onEventAdded: () => void }) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in to create an event.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.from('events').insert({
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      created_by: user.id
    })

    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    setTitle('')
    setDescription('')
    setEventDate('')
    onEventAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="section-card space-y-4">
      <h3 className="font-semibold text-white mb-2">Schedule New Event</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Event Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Sunday Worship Service"
            required
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Date *</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about the event..."
            className="input-field min-h-[80px]"
          />
        </div>
      </div>
      
      {error && <p className="text-red-400 text-xs">{error}</p>}
      
      <button 
        type="submit" 
        disabled={loading} 
        className="btn-red w-full mt-2"
      >
        {loading ? 'Scheduling...' : 'Add Event to Calendar'}
      </button>
    </form>
  )
}
