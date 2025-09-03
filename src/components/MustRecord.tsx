'use client'

import { useState, useEffect } from 'react'
import { Button, Paper, Title, Text, Container, Stack, Group, Textarea, ActionIcon } from '@mantine/core'
import { getMustRecord, addMustRecord } from '@/utils/supabase-utils'
import { IconCopy } from '@tabler/icons-react'
import dayjs from 'dayjs'

interface MustRecordProps {
  memberId: string
  memberName: string
}

export default function MustRecord({ memberId, memberName }: MustRecordProps) {
  const [yesterdayRecord, setYesterdayRecord] = useState('')
  const [todayRecord, setTodayRecord] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  useEffect(() => {
    loadYesterdayRecord()
    loadTodayRecord()
  }, [memberId])

  const loadYesterdayRecord = async () => {
    try {
      const record = await getMustRecord(memberId, yesterday)
      setYesterdayRecord(record?.content || '어제 기록이 없습니다.')
    } catch (error) {
      setYesterdayRecord('어제 기록을 불러올 수 없습니다.')
    }
  }

  const loadTodayRecord = async () => {
    try {
      const record = await getMustRecord(memberId, today)
      setTodayRecord(record?.content || '')
    } catch (error) {
      setTodayRecord('')
    }
  }

  const handleSave = async () => {
    if (!todayRecord.trim()) {
      setMessage('오늘의 MUST 내용을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      await addMustRecord(memberId, today, todayRecord.trim())
      setMessage('MUST 기록이 저장되었습니다! 1점을 획득했습니다.')
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(todayRecord)
    setMessage('오늘의 MUST 내용이 복사되었습니다!')
  }

  return (
    <Container size="lg" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="lg">
          MUST 기록 - {memberName}
        </Title>

        <Stack gap="lg">
          <Group grow align="flex-start">
            <Paper p="md" bg="gray.0" radius="md" style={{ flex: 1 }}>
              <Title order={4} mb="md">
                어제의 MUST
              </Title>
              <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                {yesterdayRecord}
              </Text>
            </Paper>

            <Paper p="md" bg="blue.0" radius="md" style={{ flex: 1 }}>
              <Title order={4} mb="md">
                오늘의 MUST
              </Title>
              <Textarea
                value={todayRecord}
                onChange={(e) => setTodayRecord(e.target.value)}
                placeholder="오늘 해야 할 일을 입력하세요..."
                minRows={4}
                mb="md"
              />
              <Group>
                <Button onClick={handleSave} loading={loading}>
                  저장
                </Button>
                {todayRecord.trim() && (
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={handleCopy}
                    title="복사"
                  >
                    <IconCopy size="1.125rem" />
                  </ActionIcon>
                )}
              </Group>
            </Paper>
          </Group>

          {message && (
            <Text c={message.includes('오류') ? 'red' : 'green'} size="sm" ta="center">
              {message}
            </Text>
          )}

          <Paper p="md" bg="yellow.0" radius="md">
            <Text size="sm" c="dimmed" ta="center">
              <strong>MUST 기록 가이드</strong><br />
              • 매일 해야 할 일을 기록하세요<br />
              • 23:59까지 기록 완료 시 1점 획득<br />
              • 어제 기록과 비교하여 계획을 세우세요<br />
              • 복사 버튼으로 오늘 내용만 복사 가능
            </Text>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  )
}
