export interface User {
  id: string
  name: string
  member_code: string
  isAdmin: boolean
}

export interface DailyStats {
  wakeupSuccess: number
  frogSuccess: number
  mustRecord: number
  totalScore: number
}

export interface MonthlyStats {
  wakeupSuccess: number
  wakeupRate: number
  totalScore: number
}

export interface CalendarDay {
  date: string
  day: number
  wakeupStatus: 'success' | 'failed' | null
  frogStatus: 'success' | 'failed' | null
  mustRecord: boolean
  score: number
}

export interface MemberRanking {
  memberId: string
  name: string
  score: number
  rank: number
}
