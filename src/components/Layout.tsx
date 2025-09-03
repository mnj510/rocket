'use client'

import { useState, useEffect } from 'react'
import { AppShell, Text, Button, Group, Stack, Burger, useMantineTheme } from '@mantine/core'
import { useRouter, usePathname } from 'next/navigation'
import { IconDashboard, IconUsers, IconSunrise, IconClipboardList, IconLogout } from '@tabler/icons-react'

interface LayoutProps {
  children: React.ReactNode
  user: { id: string; name: string; member_code: string; isAdmin: boolean }
  onLogout: () => void
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [opened, setOpened] = useState(false)
  const theme = useMantineTheme()
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      label: '대시보드',
      icon: <IconDashboard size="1.125rem" />,
      path: '/dashboard',
      adminOnly: false
    },
    {
      label: '기상 체크',
      icon: <IconSunrise size="1.125rem" />,
      path: '/wakeup',
      adminOnly: false
    },
    {
      label: 'MUST 기록',
      icon: <IconClipboardList size="1.125rem" />,
      path: '/must',
      adminOnly: false
    },
    {
      label: '멤버 관리',
      icon: <IconUsers size="1.125rem" />,
      path: '/members',
      adminOnly: true
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    setOpened(false)
  }

  const isActive = (path: string) => pathname === path

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <div className="sm:hidden">
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </div>
            <Text size="lg" fw={700}>Rocket App</Text>
          </Group>
          
          <Group>
            <Text size="sm" c="dimmed">{user.name}</Text>
            <Button variant="light" size="xs" onClick={onLogout} leftSection={<IconLogout size="1rem" />}>
              로그아웃
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Stack gap="xs">
          {navigationItems
            .filter(item => !item.adminOnly || user.isAdmin)
            .map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'filled' : 'subtle'}
                leftSection={item.icon}
                onClick={() => handleNavigation(item.path)}
                justify="flex-start"
                fullWidth
                h="auto"
                py="sm"
              >
                {item.label}
              </Button>
            ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
