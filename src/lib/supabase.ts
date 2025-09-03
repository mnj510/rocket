import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
