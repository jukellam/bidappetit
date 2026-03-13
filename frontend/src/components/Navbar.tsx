import { NavLink } from 'react-router'
import type { User } from '../types'

interface NavbarProps {
  user: User
  onLogout: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const isPlan = user.user_type === 'planner'

  return (
    <nav className="navbar">
      <div className="logo">Bid<span>Appetit</span></div>
      <div className="nav-links">
        {isPlan ? (
          <>
            <NavLink to="/planner/dashboard">Dashboard</NavLink>
            <NavLink to="/planner/events/new">Create Event</NavLink>
            <NavLink to="/planner/bookings">My Bookings</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/restaurant/dashboard">Dashboard</NavLink>
            <NavLink to="/restaurant/events">Browse Events</NavLink>
            <NavLink to="/restaurant/bids">My Bids</NavLink>
          </>
        )}
      </div>
      <div className="user-info">
        <span className="user-name">{user.name}</span>
        <span className={`badge badge-${user.user_type}`}>{user.user_type}</span>
        <button className="btn btn-sm" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  )
}
