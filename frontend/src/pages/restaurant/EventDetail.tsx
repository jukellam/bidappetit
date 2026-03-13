import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { api } from '../../api/client'
import type { Event } from '../../types'

export function RestaurantEventDetail() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Event>(`/api/events/${id}`).then(setEvent).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load')).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error-message">{error}</div>
  if (!event) return <div className="error-message">Event not found</div>

  const myBid = event.my_bid
  const deadlinePassed = new Date(event.bid_deadline) < new Date()
  const canBid = event.status === 'open' && !deadlinePassed && !myBid

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{event.title}</h1>
          <p>{event.city} &middot; {event.date} at {event.time}</p>
        </div>
        <span className={`badge badge-${event.status}`}>{event.status}</span>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Guests</div><div className="detail-value">{event.guest_count}</div></div>
          <div className="detail-item"><div className="detail-label">Budget</div><div className="detail-value">${event.budget_min.toLocaleString()} - ${event.budget_max.toLocaleString()}</div></div>
          <div className="detail-item"><div className="detail-label">Event Type</div><div className="detail-value">{event.event_type}</div></div>
          <div className="detail-item"><div className="detail-label">Bid Deadline</div><div className="detail-value">{new Date(event.bid_deadline).toLocaleDateString()}</div></div>
          {event.duration_hours && <div className="detail-item"><div className="detail-label">Duration</div><div className="detail-value">{event.duration_hours} hours</div></div>}
          <div className="detail-item"><div className="detail-label">Bids</div><div className="detail-value">{event.bid_count} received</div></div>
          {event.cuisine_preferences && <div className="detail-item"><div className="detail-label">Cuisine Pref</div><div className="detail-value">{event.cuisine_preferences}</div></div>}
          {event.dietary_restrictions && <div className="detail-item"><div className="detail-label">Dietary</div><div className="detail-value">{event.dietary_restrictions}</div></div>}
          {event.vibe && <div className="detail-item"><div className="detail-label">Vibe</div><div className="detail-value">{event.vibe}</div></div>}
        </div>
        <p style={{ marginTop: '16px', color: 'var(--color-gray-700)', fontSize: '0.9rem' }}>{event.description}</p>
        {event.special_requests && (
          <p style={{ marginTop: '8px', color: 'var(--color-gray-500)', fontSize: '0.85rem' }}><strong>Special requests:</strong> {event.special_requests}</p>
        )}
      </div>

      {canBid && (
        <Link to={`/restaurant/events/${event.id}/bid`} className="btn btn-primary" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          Submit a Bid
        </Link>
      )}

      {myBid && (
        <>
          <h2 className="section-heading">Your Bid</h2>
          <div className={`bid-card${myBid.status === 'accepted' ? ' accepted' : ''}`}>
            <div className="bid-card-header">
              <div className="bid-price">${myBid.price_total.toLocaleString()}</div>
              <span className={`badge badge-${myBid.status}`}>{myBid.status}</span>
            </div>
            {myBid.price_per_person && <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>${myBid.price_per_person}/person</p>}
            <div className="bid-card-body">
              <p>{myBid.proposal_text}</p>
              {myBid.menu_details && <p><strong>Menu:</strong> {myBid.menu_details}</p>}
              {myBid.space_details && <p><strong>Space:</strong> {myBid.space_details}</p>}
              {myBid.inclusions && <p><strong>Includes:</strong> {myBid.inclusions}</p>}
            </div>
            {myBid.status === 'pending' && (
              <div className="bid-actions">
                <Link to={`/restaurant/events/${event.id}/bid`} className="btn btn-sm">Edit Bid</Link>
              </div>
            )}
          </div>
        </>
      )}

      {deadlinePassed && !myBid && event.status === 'open' && (
        <div className="empty-state">
          <h3>Bid deadline has passed</h3>
          <p>You can no longer submit a bid for this event</p>
        </div>
      )}
    </div>
  )
}
