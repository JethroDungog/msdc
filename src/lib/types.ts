// Shared types for MSDC app

export interface Announcement {
  id: string
  title: string
  body: string
  created_at: string
  profiles?: { full_name: string } | null
}

export interface Member {
  id: string
  full_name: string
  phone: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'leader'
  created_at?: string
}

export interface Leader extends Profile {
  role: 'admin' | 'leader'
  memberCount: number
}

export interface ChurchEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  created_at: string
  profiles?: { full_name: string } | null
}

export interface Visitor {
  id: string
  full_name: string
  phone: string | null
  visit_date: string
  notes: string | null
  status: 'visitor' | 'converted'
  created_at: string
}
