import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { User } from '../types'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<User[]>('/api/users').then(setUsers).finally(() => setLoading(false))
  }, [])

  const handleSelect = async (userId: number) => {
    const user = await api.post<User>('/api/auth/login', { user_id: userId })
    onLogin(user)
  }

  if (loading) return <div className="loading">Loading...</div>

  const planners = users.filter(u => u.user_type === 'planner')
  const restaurants = users.filter(u => u.user_type === 'restaurant')

  return (
    <div className="login-page">
      <h1>Bid<span>Appetit</span></h1>
      <p>Select a user to sign in as</p>

      <div className="user-group">
        <h2>Event Planners</h2>
        <div className="users-grid">
          {planners.map(u => (
            <button key={u.id} className="user-button" onClick={() => handleSelect(u.id)}>
              <div>
                <div className="user-button-name">{u.name}</div>
                <div className="user-button-detail">{u.email}</div>
              </div>
              <span className="badge badge-planner">Planner</span>
            </button>
          ))}
        </div>
      </div>

      <div className="user-group">
        <h2>Restaurants</h2>
        <div className="users-grid">
          {restaurants.map(u => (
            <button key={u.id} className="user-button" onClick={() => handleSelect(u.id)}>
              <div>
                <div className="user-button-name">{u.restaurant_profile?.name ?? u.name}</div>
                <div className="user-button-detail">{u.restaurant_profile?.cuisine_type} &middot; {u.restaurant_profile?.city}</div>
              </div>
              <span className="badge badge-restaurant">Restaurant</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
