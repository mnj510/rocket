import { supabase, isSupabaseConfigured, Member, WakeupLog, MustRecord, MobileLoginCode } from '@/lib/supabase'

// 멤버 관련 함수들
export const getMembers = async (): Promise<Member[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured')
    return []
  }
  
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const addMember = async (name: string, memberCode: string): Promise<Member> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }
  
  const { data, error } = await supabase
    .from('members')
    .insert([{ name, member_code: memberCode }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteMember = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }
  
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 기상 로그 관련 함수들
export const getWakeupLogs = async (memberId: string, month: string): Promise<WakeupLog[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured')
    return []
  }
  
  const { data, error } = await supabase
    .from('wakeup_logs')
    .select('*')
    .eq('member_id', memberId)
    .gte('date', `${month}-01`)
    .lt('date', `${month}-32`)
    .order('date', { ascending: true })
  
  if (error) throw error
  return data || []
}

export const addWakeupLog = async (
  memberId: string, 
  date: string, 
  type: 'wakeup' | 'frog'
): Promise<WakeupLog> => {
  // 기존 로그가 있는지 확인
  const { data: existingLog } = await supabase
    .from('wakeup_logs')
    .select('*')
    .eq('member_id', memberId)
    .eq('date', date)
    .single()
  
  if (existingLog) {
    // 기존 로그 업데이트
    const updateData = type === 'wakeup' 
      ? { wakeup_status: 'success', wakeup_time: new Date().toISOString() }
      : { frog_status: 'success', frog_time: new Date().toISOString() }
    
    const { data, error } = await supabase
      .from('wakeup_logs')
      .update(updateData)
      .eq('id', existingLog.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    // 새 로그 생성
    const insertData = type === 'wakeup'
      ? { member_id: memberId, date, wakeup_status: 'success', wakeup_time: new Date().toISOString() }
      : { member_id: memberId, date, frog_status: 'success', frog_time: new Date().toISOString() }
    
    const { data, error } = await supabase
      .from('wakeup_logs')
      .insert([insertData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const updateWakeupStatus = async (
  memberId: string,
  date: string,
  wakeupStatus: 'success' | 'failed',
  frogStatus: 'success' | 'failed'
): Promise<void> => {
  const { data: existingLog } = await supabase
    .from('wakeup_logs')
    .select('*')
    .eq('member_id', memberId)
    .eq('date', date)
    .single()
  
  if (existingLog) {
    const { error } = await supabase
      .from('wakeup_logs')
      .update({ wakeup_status: wakeupStatus, frog_status: frogStatus })
      .eq('id', existingLog.id)
    
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('wakeup_logs')
      .insert([{
        member_id: memberId,
        date,
        wakeup_status: wakeupStatus,
        frog_status: frogStatus
      }])
    
    if (error) throw error
  }
}

// MUST 기록 관련 함수들
export const getMustRecord = async (memberId: string, date: string): Promise<MustRecord | null> => {
  const { data, error } = await supabase
    .from('must_records')
    .select('*')
    .eq('member_id', memberId)
    .eq('date', date)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const addMustRecord = async (memberId: string, date: string, content: string): Promise<MustRecord> => {
  const { data, error } = await supabase
    .from('must_records')
    .insert([{ member_id: memberId, date, content }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteMustRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('must_records')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 월별 통계 함수
export const getMonthlyStats = async (month: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('wakeup_logs')
    .select(`
      member_id,
      date,
      wakeup_status,
      frog_status
    `)
    .gte('date', `${month}-01`)
    .lt('date', `${month}-32`)
  
  if (error) throw error
  return data || []
}

// 모바일 로그인 코드 관련 함수들
export const generateMobileLoginCode = async (memberCode: string): Promise<string> => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10분 후 만료
  
  const { error } = await supabase
    .from('mobile_login_codes')
    .insert([{ member_code: memberCode, code, expires_at: expiresAt }])
  
  if (error) throw error
  return code
}

export const verifyMobileLoginCode = async (memberCode: string, code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('mobile_login_codes')
    .select('*')
    .eq('member_code', memberCode)
    .eq('code', code)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (error) return false
  return !!data
}
