'use client'

import { useState, useEffect } from 'react'
import { MantineProvider } from '@mantine/core'
import Login from '@/components/Login'
import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'
import WakeupCheck from '@/components/WakeupCheck'
import MustRecord from '@/components/MustRecord'
import MemberManagement from '@/components/MemberManagement'
import { useRouter, usePathname } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<{ id: string; name: string; member_code: string; isAdmin: boolean } | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // GitHub Pages SPA 라우팅 처리
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const pathParam = url.searchParams.get('?/')
      
      if (pathParam) {
        // URL 파라미터에서 경로 추출하여 라우팅
        const targetPath = '/' + pathParam
        router.replace(targetPath)
        return
      }
    }
    
    // 로컬 스토리지에서 사용자 정보 복원
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [router])

  const handleLogin = (userData: { id: string; name: string; member_code: string; isAdmin: boolean }) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    router.push('/dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return (
      <MantineProvider>
        <Login onLogin={handleLogin} />
      </MantineProvider>
    )
  }

  const renderContent = () => {
    switch (pathname) {
      case '/dashboard':
        return <Dashboard user={user} />
      case '/wakeup':
        return <WakeupCheck memberId={user.id} memberName={user.name} />
      case '/must':
        return <MustRecord memberId={user.id} memberName={user.name} />
      case '/members':
        return user.isAdmin ? <MemberManagement /> : <Dashboard user={user} />
      default:
        return <Dashboard user={user} />
    }
  }

  return (
    <MantineProvider>
      <Layout user={user} onLogout={handleLogout}>
        {renderContent()}
      </Layout>
    </MantineProvider>
  )
}
