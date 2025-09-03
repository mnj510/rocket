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
      const currentUrl = window.location.href
      console.log('Main page loaded, Current URL:', currentUrl)
      
      // URL에 ?/ 패턴이 있는지 확인
      if (currentUrl.includes('/?/')) {
        const pathParam = currentUrl.split('/?/')[1]
        console.log('Path parameter found:', pathParam)
        
        if (pathParam) {
          // URL 파라미터에서 경로 추출하여 라우팅
          const targetPath = '/' + pathParam
          console.log('Redirecting to:', targetPath)
          
          // 약간의 지연 후 라우팅 (상태 업데이트를 위해)
          setTimeout(() => {
            router.replace(targetPath)
          }, 100)
          return
        }
      }
      
      // URL에 직접 경로가 있는지 확인 (예: /rocket/dashboard)
      const pathname = window.location.pathname
      if (pathname.includes('/rocket/') && pathname !== '/rocket/' && pathname !== '/rocket') {
        const directPath = pathname.replace('/rocket', '')
        console.log('Direct path found:', directPath)
        
        if (directPath) {
          console.log('Redirecting to direct path:', directPath)
          setTimeout(() => {
            router.replace(directPath)
          }, 100)
          return
        }
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
