import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, getCurrentUser } from '../../api/client'
import type { Event, Booking } from '../../types'

export function RestaurantDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()!

  useEffect(() => {
    Promise.all([
      api.get<Event[]>('/api/events?status=open'),
      api.get<Booking[]>('/api/bookings'),
    ]).then(([ev, bk]) => {
      setEvents(ev)
      setBookings(bk)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  const city = user.restaurant_profile?.city
  const cityEvents = events.filter(e => e.city === city)

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.restaurant_profile?.name ?? user.name}</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="number">{cityEvents.length}</div>
          <div className="label">Events in {city}</div>
        </div>
        <div className="summary-card">
          <div className="number">{events.filter(e => e.my_bid).length}</div>
          <div className="label">Active Bids</div>
        </div>
        <div className="summary-card">
          <div className="number">{bookings.length}</div>
          <div className="label">Bookings</div>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/restaurant/events" className="btn btn-primary">Browse Events</Link>
        <Link to="/restaurant/bids" className="btn">My Bids</Link>
      </div>

      <h2 className="section-heading">Recent Events in {city}</h2>
      {cityEvents.length === 0 ? (
        <div className="empty-state">
          <h3>No open events in {city}</h3>
          <p>Check back later for new opportunities</p>
        </div>
      ) : (
        cityEvents.slice(0, 5).map(event => (
          <Link key={event.id} to={`/restaurant/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
