import { formatDistanceToNow } from 'date-fns'

interface Announcement {
  id: string
  title: string
  body: string
  created_at: string
  profiles?: { full_name: string } | null
}

interface AnnouncementCardProps {
  announcement: Announcement
  isAdmin?: boolean
  onDelete?: (id: string) => void
}

export default function AnnouncementCard({
  announcement,
  isAdmin = false,
  onDelete,
}: AnnouncementCardProps) {
  const timeAgo = formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })

  return (
    <div className="group relative section-card flex gap-4 hover:border-red-600/30 transition-all duration-200 animate-fade-in">
      {/* Red accent left bar */}
      <div className="shrink-0 w-1 self-stretch rounded-full bg-gradient-to-b from-red-500 to-red-800" />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">{announcement.title}</h3>
          {isAdmin && onDelete && (
            <button
              id={`delete-announcement-${announcement.id}`}
              onClick={() => onDelete(announcement.id)}
              className="btn-danger shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete announcement"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>

        {/* Body */}
        <p className="mt-1.5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {announcement.body}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>
              {announcement.profiles?.full_name ?? 'Pastor'}
            </span>
          </div>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  )
}
