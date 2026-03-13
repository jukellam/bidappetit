import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, getCurrentUser } from '../../api/client'
import type { Event, Booking } from '../../types'

export function PlannerDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()!

  useEffect(() => {
    Promise.all([
      api.get<Event[]>('/api/events'),
      api.get<Booking[]>('/api/bookings'),
    ]).then(([ev, bk]) => {
      setEvents(ev.filter(e => e.planner_id === user.id))
      setBookings(bk)
    }).finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <div className="loading">Loading...</div>

  const openEvents = events.filter(e => e.status === 'open')
  const withBids = openEvents.filter(e => e.bid_count > 0)

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="number">{openEvents.length}</div>
          <div className="label">Open Events</div>
        </div>
        <div className="summary-card">
          <div className="number">{withBids.length}</div>
          <div className="label">Events with Bids</div>
        </div>
        <div className="summary-card">
          <div className="number">{bookings.length}</div>
          <div className="label">Bookings</div>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/planner/events/new" className="btn btn-primary">Create Event</Link>
        <Link to="/planner/bookings" className="btn">View Bookings</Link>
      </div>

      <h2 className="section-heading">Your Events</h2>
      {events.length === 0 ? (
        <div className="empty-state">
          <h3>No events yet</h3>
          <p>Create your first event to get started</p>
        </div>
      ) : (
        events.slice(0, 5).map(event => (
          <Link key={event.id} to={`/planner/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="event-card">
              <div className="event-card-header">
                <h3>{event.title}</h3>
                <span className={`badge badge-${event.status}`}>{event.status}</span>
              </div>
              <div className="event-meta">
                <span>{event.city}</span>
                <span>{event.date}</span>
                <span>{event.guest_count} guests</span>
                <span>${event.budget_min.toLocaleString()} - ${event.budget_max.toLocaleString()}</span>
                <span>{event.bid_count} bid{event.bid_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
