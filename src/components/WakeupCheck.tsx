'use client'

import { useState, useEffect } from 'react'
import { Button, Paper, Title, Text, Container, Stack, Group, Badge } from '@mantine/core'
import { addWakeupLog } from '@/utils/supabase-utils'
import dayjs from 'dayjs'

interface WakeupCheckProps {
  memberId: string
  memberName: string
}

export default function WakeupCheck({ memberId, memberName }: WakeupCheckProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [wakeupCompleted, setWakeupCompleted] = useState(false)
  const [frogCompleted, setFrogCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const today = dayjs().format('YYYY-MM-DD')
  const currentHour = currentTime.getHours()
  const canWakeup = currentHour >= 0 && currentHour < 5

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleWakeup = async () => {
    if (!canWakeup) {
      setMessage('기상 체크는 00:00~04:59 사이에만 가능합니다.')
      return
    }

    setLoading(true)
    try {
      await addWakeupLog(memberId, today, 'wakeup')
      setWakeupCompleted(true)
      setMessage('기상 완료! 1점을 획득했습니다.')
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleFrog = async () => {
    if (!wakeupCompleted) {
      setMessage('먼저 기상 체크를 완료해주세요.')
      return
    }

    setLoading(true)
    try {
      await addWakeupLog(memberId, today, 'frog')
      setFrogCompleted(true)
      setMessage('개구리 잡기 완료! 1점을 획득했습니다.')
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="md" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="lg">
          기상 체크 - {memberName}
        </Title>

        <Stack gap="lg" align="center">
          <Text size="xl" fw={500}>
            현재 시간: {currentTime.toLocaleTimeString()}
          </Text>

          <Text size="lg" c="dimmed">
            오늘 날짜: {dayjs().format('YYYY년 MM월 DD일')}
          </Text>

          <Group gap="md">
            <Button
              size="lg"
              color={wakeupCompleted ? 'green' : 'blue'}
              onClick={handleWakeup}
              disabled={!canWakeup || wakeupCompleted || loading}
              loading={loading}
            >
              {wakeupCompleted ? '기상 완료' : '기상 완료'}
            </Button>

            <Button
              size="lg"
              color={frogCompleted ? 'green' : 'orange'}
              onClick={handleFrog}
              disabled={!wakeupCompleted || frogCompleted || loading}
              loading={loading}
            >
              {frogCompleted ? '개구리 잡기 완료' : '개구리 잡기 완료'}
            </Button>
          </Group>

          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">
              오늘의 기록
            </Text>
            <Group gap="xs">
              <Badge color={wakeupCompleted ? 'green' : 'gray'}>
                기상: {wakeupCompleted ? '완료' : '미완료'}
              </Badge>
              <Badge color={frogCompleted ? 'green' : 'gray'}>
                개구리: {frogCompleted ? '완료' : '미완료'}
              </Badge>
            </Group>
          </Stack>

          {message && (
            <Text c={message.includes('오류') ? 'red' : 'green'} size="sm" ta="center">
              {message}
            </Text>
          )}

          <Paper p="md" bg="gray.0" radius="md" w="100%">
            <Text size="sm" c="dimmed" ta="center">
              <strong>점수 획득 가이드</strong><br />
              • 기상 완료 (00:00~04:59): 1점<br />
              • 개구리 잡기 완료 (기상 후): 1점<br />
              • MUST 기록 (23:59까지): 1점<br />
              • 하루 최대 3점 획득 가능
            </Text>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  )
}
