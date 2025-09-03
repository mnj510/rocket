'use client'

import { useState, useEffect } from 'react'
import { Paper, Title, Text, Container, Stack, Group, Grid, Select, Badge, Button } from '@mantine/core'
import { getMembers, getMonthlyStats, getWakeupLogs, getMustRecord } from '@/utils/supabase-utils'
import { Member, WakeupLog, MustRecord } from '@/lib/supabase'
import { CalendarDay, MemberRanking } from '@/types'
import dayjs from 'dayjs'

interface DashboardProps {
  user: { id: string; name: string; member_code: string; isAdmin: boolean }
}

export default function Dashboard({ user }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'))
  const [members, setMembers] = useState<Member[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any[]>([])
  const [userWakeupLogs, setUserWakeupLogs] = useState<WakeupLog[]>([])
  const [userMustRecords, setUserMustRecords] = useState<MustRecord[]>([])

  useEffect(() => {
    loadData()
  }, [selectedMonth, user])

  const loadData = async () => {
    try {
      const [membersData, statsData] = await Promise.all([
        getMembers(),
        getMonthlyStats(selectedMonth)
      ])
      
      setMembers(membersData)
      setMonthlyStats(statsData)

      if (!user.isAdmin) {
        const [wakeupLogs, mustRecords] = await Promise.all([
          getWakeupLogs(user.id, selectedMonth),
          Promise.all(
            Array.from({ length: dayjs(selectedMonth).daysInMonth() }, (_, i) => {
              const date = dayjs(selectedMonth).add(i, 'day').format('YYYY-MM-DD')
              return getMustRecord(user.id, date)
            })
          )
        ])
        
        setUserWakeupLogs(wakeupLogs)
        setUserMustRecords(mustRecords.filter(Boolean) as MustRecord[])
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    }
  }

  const getCurrentMonthStats = () => {
    const currentMonth = dayjs().format('YYYY-MM')
    const currentDay = dayjs().date()
    
    return `${currentDay} / ${dayjs().month() + 1}`
  }

  const getUserMonthlyStats = () => {
    if (user.isAdmin) return null

    const monthStart = dayjs(selectedMonth).startOf('month')
    const monthEnd = dayjs(selectedMonth).endOf('month')
    
    const wakeupSuccess = userWakeupLogs.filter(log => 
      log.wakeup_status === 'success' && 
      dayjs(log.date).isSame(monthStart, 'month')
    ).length

    const totalDays = monthEnd.diff(monthStart, 'day') + 1
    const wakeupRate = totalDays > 0 ? Math.round((wakeupSuccess / totalDays) * 100) : 0

    const totalScore = userWakeupLogs.reduce((score, log) => {
      let dayScore = 0
      if (log.wakeup_status === 'success') dayScore += 1
      if (log.frog_status === 'success') dayScore += 1
      
      const mustRecord = userMustRecords.find(record => record.date === log.date)
      if (mustRecord) dayScore += 1
      
      return score + dayScore
    }, 0)

    return { wakeupSuccess, wakeupRate, totalScore }
  }

  const getOverallStats = () => {
    if (!user.isAdmin) return null

    const totalMembers = members.length
    const totalWakeupSuccess = monthlyStats.filter(log => log.wakeup_status === 'success').length
    const totalDays = monthlyStats.length
    const overallWakeupRate = totalDays > 0 ? Math.round((totalWakeupSuccess / totalDays) * 100) : 0

    const totalScore = monthlyStats.reduce((score, log) => {
      let dayScore = 0
      if (log.wakeup_status === 'success') dayScore += 1
      if (log.frog_status === 'success') dayScore += 1
      return score + dayScore
    }, 0)

    return { totalMembers, totalWakeupSuccess, overallWakeupRate, totalScore }
  }

  const generateCalendarDays = (): CalendarDay[] => {
    if (user.isAdmin) return []

    const monthStart = dayjs(selectedMonth).startOf('month')
    const monthEnd = dayjs(selectedMonth).endOf('month')
    const days: CalendarDay[] = []

    for (let i = 0; i < monthStart.day(); i++) {
      days.push({
        date: '',
        day: 0,
        wakeupStatus: null,
        frogStatus: null,
        mustRecord: false,
        score: 0
      })
    }

    for (let i = 1; i <= monthEnd.date(); i++) {
      const date = monthStart.date(i).format('YYYY-MM-DD')
      const wakeupLog = userWakeupLogs.find(log => log.date === date)
      const mustRecord = userMustRecords.find(record => record.date === date)
      
      let score = 0
      if (wakeupLog?.wakeup_status === 'success') score += 1
      if (wakeupLog?.frog_status === 'success') score += 1
      if (mustRecord) score += 1

      days.push({
        date,
        day: i,
        wakeupStatus: wakeupLog?.wakeup_status || null,
        frogStatus: wakeupLog?.frog_status || null,
        mustRecord: !!mustRecord,
        score
      })
    }

    return days
  }

  const getMemberRankings = (): MemberRanking[] => {
    if (!user.isAdmin) return []

    const memberScores = new Map<string, { name: string; score: number }>()
    
    monthlyStats.forEach(log => {
      const member = members.find(m => m.id === log.member_id)
      if (!member) return

      const currentScore = memberScores.get(member.id)?.score || 0
      let dayScore = 0
      if (log.wakeup_status === 'success') dayScore += 1
      if (log.frog_status === 'success') dayScore += 1
      
      memberScores.set(member.id, {
        name: member.name,
        score: currentScore + dayScore
      })
    })

    return Array.from(memberScores.entries())
      .map(([memberId, { name, score }]) => ({ memberId, name, score, rank: 0 }))
      .sort((a, b) => b.score - a.score)
      .map((member, index) => ({
        ...member,
        rank: index + 1
      }))
  }

  const calendarDays = generateCalendarDays()
  const userStats = getUserMonthlyStats()
  const overallStats = getOverallStats()
  const memberRankings = getMemberRankings()

  return (
    <Container size="xl" mt="xl">
      <Stack gap="lg">
        {/* 월 선택 */}
        <Group justify="center">
          <Select
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value || dayjs().format('YYYY-MM'))}
            data={Array.from({ length: 12 }, (_, i) => {
              const month = dayjs().subtract(i, 'month').format('YYYY-MM')
              return { value: month, label: dayjs(month).format('YYYY년 MM월') }
            })}
            w={200}
          />
        </Group>

        {/* 통계 카드 */}
        <Grid>
          {user.isAdmin ? (
            // 관리자 통계
            <>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="blue">{overallStats?.totalMembers || 0}</Title>
                  <Text size="sm" c="dimmed">전체 멤버</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="green">{overallStats?.totalWakeupSuccess || 0}</Title>
                  <Text size="sm" c="dimmed">전체 기상 성공</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="orange">{overallStats?.overallWakeupRate || 0}%</Title>
                  <Text size="sm" c="dimmed">전체 기상률</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="purple">{overallStats?.totalScore || 0}</Title>
                  <Text size="sm" c="dimmed">전체 점수</Text>
                </Paper>
              </Grid.Col>
            </>
          ) : (
            // 멤버 통계
            <>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="blue">{getCurrentMonthStats()}</Title>
                  <Text size="sm" c="dimmed">오늘</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="green">{userStats?.wakeupSuccess || 0}</Title>
                  <Text size="sm" c="dimmed">기상 성공</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="orange">{userStats?.wakeupRate || 0}%</Title>
                  <Text size="sm" c="dimmed">기상률</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="md" ta="center" shadow="sm">
                  <Title order={3} c="purple">{userStats?.totalScore || 0}</Title>
                  <Text size="sm" c="dimmed">총 점수</Text>
                </Paper>
              </Grid.Col>
            </>
          )}
        </Grid>

        {!user.isAdmin && (
          // 멤버 전용 달력
          <Paper p="xl" shadow="md">
            <Title order={3} mb="lg">내 월별 기상 현황</Title>
            <Grid gutter="xs">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <Grid.Col span={1} key={day}>
                  <Paper p="xs" ta="center" bg="gray.1">
                    <Text size="sm" fw={500}>{day}</Text>
                  </Paper>
                </Grid.Col>
              ))}
              {calendarDays.map((day, index) => (
                <Grid.Col span={1} key={index}>
                  {day.day > 0 ? (
                    <Paper p="xs" ta="center" pos="relative">
                      <Text size="sm">{day.day}</Text>
                      <div style={{ position: 'absolute', top: 2, right: 2 }}>
                        {day.wakeupStatus === 'success' && (
                          <div style={{ width: 8, height: 8, backgroundColor: 'blue', borderRadius: '50%' }} />
                        )}
                        {day.wakeupStatus === 'failed' && (
                          <div style={{ width: 8, height: 8, backgroundColor: 'red', borderRadius: '50%' }} />
                        )}
                        {day.score > 0 && (
                          <div style={{ width: 8, height: 8, backgroundColor: 'yellow', borderRadius: '50%', marginTop: 2 }} />
                        )}
                      </div>
                    </Paper>
                  ) : (
                    <Paper p="xs" ta="center" bg="gray.0">
                      <Text size="sm" c="dimmed">-</Text>
                    </Paper>
                  )}
                </Grid.Col>
              ))}
            </Grid>
          </Paper>
        )}

        {user.isAdmin && (
          // 관리자 전용 멤버 순위
          <Paper p="xl" shadow="md">
            <Title order={3} mb="lg">멤버별 점수 순위</Title>
            <Stack gap="xs">
              {memberRankings.map((member, index) => (
                <Paper 
                  key={member.memberId} 
                  p="md" 
                  bg={member.memberId === user.id ? 'blue.0' : 'gray.0'}
                  shadow="sm"
                >
                  <Group justify="space-between">
                    <Group>
                      <Badge variant="light" color="blue">{member.rank}위</Badge>
                      <Text fw={500}>{member.name}</Text>
                    </Group>
                    <Text fw={700} size="lg">{member.score}점</Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}
