import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import type { User } from './types'
import { setCurrentUser, clearCurrentUser } from './api/client'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { PlannerDashboard } from './pages/planner/Dashboard'
import { CreateEvent } from './pages/planner/CreateEvent'
import { PlannerEventDetail } from './pages/planner/EventDetail'
import { MyBookings } from './pages/planner/MyBookings'
import { RestaurantDashboard } from './pages/restaurant/Dashboard'
import { BrowseEvents } from './pages/restaurant/BrowseEvents'
import { RestaurantEventDetail } from './pages/restaurant/EventDetail'
import { SubmitBid } from './pages/restaurant/SubmitBid'
import { MyBidsPage } from './pages/restaurant/MyBids'

function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (u: User) => {
    setUser(u)
    setCurrentUser(u)
  }

  const handleLogout = () => {
    setUser(null)
    clearCurrentUser()
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    )
  }

  const defaultPath = user.user_type === 'planner' ? '/planner/dashboard' : '/restaurant/dashboard'

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route path="/planner/dashboard" element={<PlannerDashboard />} />
          <Route path="/planner/events/new" element={<CreateEvent />} />
          <Route path="/planner/events/:id" element={<PlannerEventDetail />} />
          <Route path="/planner/bookings" element={<MyBookings />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant/events" element={<BrowseEvents />} />
          <Route path="/restaurant/events/:id" element={<RestaurantEventDetail />} />
          <Route path="/restaurant/events/:id/bid" element={<SubmitBid />} />
          <Route path="/restaurant/bids" element={<MyBidsPage />} />
        </Route>
        <Route path="/login" element={<Navigate to={defaultPath} />} />
        <Route path="*" element={<Navigate to={defaultPath} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
