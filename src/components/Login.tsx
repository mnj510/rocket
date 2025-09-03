'use client'

import { useState } from 'react'
import { Button, TextInput, Paper, Title, Container, Text, Group, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'

interface LoginProps {
  onLogin: (user: { id: string; name: string; member_code: string; isAdmin: boolean }) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [memberCode, setMemberCode] = useState('')
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAdminLogin = () => {
    if (adminId === 'mnj510' && adminPassword === 'asdf6014!!') {
      onLogin({
        id: 'admin',
        name: '관리자',
        member_code: 'admin',
        isAdmin: true
      })
      router.push('/dashboard')
    } else {
      setError('관리자 정보가 올바르지 않습니다.')
    }
  }

  const handleMemberLogin = () => {
    if (memberCode.trim()) {
      // 멤버 코드로 로그인 (실제로는 Supabase에서 검증해야 함)
      onLogin({
        id: `member-${memberCode}`,
        name: `멤버 ${memberCode}`,
        member_code: memberCode,
        isAdmin: false
      })
      router.push('/dashboard')
    } else {
      setError('멤버 코드를 입력해주세요.')
    }
  }

  return (
    <Container size="xs" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="lg">
          로그인
        </Title>

        <Stack gap="md">
          <Group justify="center" mb="md">
            <Button
              variant={isAdmin ? 'filled' : 'outline'}
              onClick={() => setIsAdmin(true)}
            >
              관리자
            </Button>
            <Button
              variant={!isAdmin ? 'filled' : 'outline'}
              onClick={() => setIsAdmin(false)}
            >
              멤버
            </Button>
          </Group>

          {isAdmin ? (
            <Stack gap="md">
              <TextInput
                label="관리자 ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="관리자 ID를 입력하세요"
              />
              <TextInput
                label="비밀번호"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
              <Button onClick={handleAdminLogin} fullWidth>
                관리자 로그인
              </Button>
            </Stack>
          ) : (
            <Stack gap="md">
              <TextInput
                label="멤버 코드"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="멤버 코드를 입력하세요"
              />
              <Button onClick={handleMemberLogin} fullWidth>
                멤버 로그인
              </Button>
            </Stack>
          )}

          {error && (
            <Text c="red" size="sm" ta="center">
              {error}
            </Text>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
