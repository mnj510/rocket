import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

// 빌드 시에는 더미 클라이언트, 런타임에는 실제 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export interface Member {
  id: string
  name: string
  member_code: string
  created_at: string
}

export interface WakeupLog {
  id: string
  member_id: string
  date: string
  wakeup_status: 'success' | 'failed' | null
  frog_status: 'success' | 'failed' | null
  wakeup_time: string | null
  frog_time: string | null
  created_at: string
}

export interface MustRecord {
  id: string
  member_id: string
  date: string
  content: string
  created_at: string
}

export interface MobileLoginCode {
  id: string
  member_code: string
  code: string
  expires_at: string
  created_at: string
}
