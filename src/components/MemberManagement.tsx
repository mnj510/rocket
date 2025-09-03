'use client'

import { useState, useEffect } from 'react'
import { Paper, Title, Text, Container, Stack, Group, Button, TextInput, Modal, ActionIcon } from '@mantine/core'
import { getMembers, addMember, deleteMember } from '@/utils/supabase-utils'
import { Member } from '@/lib/supabase'
import { IconTrash, IconPlus } from '@tabler/icons-react'

export default function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const membersData = await getMembers()
      setMembers(membersData)
    } catch (error) {
      console.error('멤버 로드 오류:', error)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      setMessage('멤버 이름을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const memberCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      await addMember(newMemberName.trim(), memberCode)
      setNewMemberName('')
      setAddModalOpen(false)
      setMessage('멤버가 추가되었습니다.')
      loadMembers()
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`정말로 "${memberName}" 멤버를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deleteMember(memberId)
      setMessage('멤버가 삭제되었습니다.')
      loadMembers()
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <Container size="lg" mt="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Group justify="space-between" mb="lg">
          <Title order={2}>멤버 관리</Title>
          <Button 
            leftSection={<IconPlus size="1rem" />}
            onClick={() => setAddModalOpen(true)}
          >
            멤버 추가
          </Button>
        </Group>

        <Stack gap="md">
          {members.map((member) => (
            <Paper key={member.id} p="md" bg="gray.0" radius="md">
              <Group justify="space-between">
                <Stack gap="xs">
                  <Text fw={500}>{member.name}</Text>
                  <Text size="sm" c="dimmed">멤버 코드: {member.member_code}</Text>
                  <Text size="xs" c="dimmed">
                    가입일: {new Date(member.created_at).toLocaleDateString()}
                  </Text>
                </Stack>
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => handleDeleteMember(member.id, member.name)}
                  title="삭제"
                >
                  <IconTrash size="1.125rem" />
                </ActionIcon>
              </Group>
            </Paper>
          ))}

          {members.length === 0 && (
            <Paper p="xl" ta="center" bg="gray.0">
              <Text c="dimmed">등록된 멤버가 없습니다.</Text>
            </Paper>
          )}
        </Stack>

        {message && (
          <Text c={message.includes('오류') ? 'red' : 'green'} size="sm" ta="center" mt="md">
            {message}
          </Text>
        )}
      </Paper>

      {/* 멤버 추가 모달 */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="새 멤버 추가"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="멤버 이름"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="멤버 이름을 입력하세요"
            required
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddMember} loading={loading}>
              추가
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
