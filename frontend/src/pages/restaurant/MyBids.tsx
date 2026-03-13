import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { Event } from '../../types'

export function MyBidsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Event[]>('/api/events?has_bid=true').then(ev => {
      setEvents(ev)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>My Bids</h1>
        <p>Track your submitted bids</p>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <h3>No bids yet</h3>
          <p>Browse events and submit your first bid</p>
        </div>
      ) : (
        events.map(event => {
          const bid = event.my_bid!
          return (
            <Link key={event.id} to={`/restaurant/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="bid-card">
                <div className="bid-card-header">
                  <h4>{event.title}</h4>
                  <span className={`badge badge-${bid.status}`}>{bid.status}</span>
                </div>
                <div className="bid-price">${bid.price_total.toLocaleString()}</div>
                <div className="event-meta" style={{ marginTop: '8px' }}>
                  <span>{event.city}</span>
                  <span>{event.date}</span>
                  <span>{event.guest_count} guests</span>
                  <span>Event: {event.status}</span>
                </div>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
