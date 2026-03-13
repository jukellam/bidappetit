import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import type { User } from '../types'

interface LayoutProps {
  user: User
  onLogout: () => void
}

export function Layout({ user, onLogout }: LayoutProps) {
  return (
    <div className="app">
      <Navbar user={user} onLogout={onLogout} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
