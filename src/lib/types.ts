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
  email: string | null
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
