import { format } from 'date-fns'
import type { ChurchEvent } from '@/lib/types'

interface EventCardProps {
  event: ChurchEvent
  isAdmin: boolean
  onDelete?: (id: string) => void
}

export default function EventCard({ event, isAdmin, onDelete }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date(new Date().setHours(0,0,0,0))

  return (
    <div className={`section-card relative group transition-all hover:border-black/15 dark:hover:border-white/20 ${isPast ? 'opacity-60' : ''}`}>
      {isAdmin && onDelete && (
        <button
          onClick={() => onDelete(event.id)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete Event"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Date Box */}
        <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl min-w-[60px] p-2 border border-black/10 dark:border-white/10 shrink-0">
          <span className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
            {format(eventDate, 'MMM')}
          </span>
          <span className="text-gray-900 dark:text-white text-2xl font-black">
            {format(eventDate, 'dd')}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1 pr-6">
          <h4 className="text-gray-900 dark:text-white font-semibold text-base leading-tight truncate">
            {event.title}
          </h4>
          
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {format(eventDate, 'EEEE')}
            </span>
          </div>

          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
          
          {isAdmin && event.profiles && (
            <p className="text-xs text-gray-500 dark:text-gray-600 mt-3 border-t border-black/5 dark:border-white/5 pt-2">
              Created by {event.profiles.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
