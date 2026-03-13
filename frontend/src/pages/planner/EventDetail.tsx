import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { api } from '../../api/client'
import type { Event, Bid, Booking } from '../../types'

export function PlannerEventDetail() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set())
  const [comparing, setComparing] = useState(false)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)

  const fetchEvent = useCallback(() => {
    api.get<Event>(`/api/events/${id}`).then(setEvent).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  // Poll for new bids every 15s when event is open
  useEffect(() => {
    if (!event || event.status !== 'open') return
    const interval = setInterval(fetchEvent, 15000)
    return () => clearInterval(interval)
  }, [event?.status, fetchEvent])

  const handleAccept = async (bidId: number) => {
    try {
      await api.post<Booking>(`/api/bids/${bidId}/accept`)
      setAcceptingId(null)
      fetchEvent()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to accept bid')
    }
  }

  const handleCancel = async () => {
    try {
      await api.patch<Event>(`/api/events/${id}/cancel`)
      fetchEvent()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to cancel event')
    }
  }

  const toggleCompare = (bidId: number) => {
    setCompareIds(prev => {
      const next = new Set(prev)
      if (next.has(bidId)) next.delete(bidId)
      else if (next.size < 3) next.add(bidId)
      return next
    })
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!event) return <div className="error-message">Event not found</div>

  const bids = event.bids ?? []
  const comparedBids = bids.filter(b => compareIds.has(b.id))

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

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
          {event.cuisine_preferences && <div className="detail-item"><div className="detail-label">Cuisine</div><div className="detail-value">{event.cuisine_preferences}</div></div>}
          {event.vibe && <div className="detail-item"><div className="detail-label">Vibe</div><div className="detail-value">{event.vibe}</div></div>}
        </div>
        <p style={{ marginTop: '12px', color: 'var(--color-gray-700)', fontSize: '0.9rem' }}>{event.description}</p>
        {event.status === 'open' && (
          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-danger btn-sm" onClick={handleCancel}>Cancel Event</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-heading" style={{ margin: 0 }}>Bids ({bids.length})</h2>
        {bids.length >= 2 && (
          <button className="btn btn-sm" onClick={() => setComparing(!comparing)}>
            {comparing ? 'Exit Compare' : 'Compare Bids'}
          </button>
        )}
      </div>

      {comparing && comparedBids.length >= 2 && (
        <div className="compare-grid" style={{ marginBottom: '24px' }}>
          {comparedBids.map(renderBidCard)}
        </div>
      )}

      {bids.length === 0 ? (
        <div className="empty-state">
          <h3>Waiting for bids...</h3>
          <p>Restaurants will see your event and submit proposals</p>
        </div>
      ) : (
        !comparing && bids.map(bid => renderBidFull(bid, event.status === 'open'))
      )}

      {comparing && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginBottom: '12px' }}>Select 2-3 bids to compare:</p>
          {bids.map(bid => (
            <label key={bid.id} className="compare-check" style={{ marginBottom: '8px' }}>
              <input type="checkbox" checked={compareIds.has(bid.id)} onChange={() => toggleCompare(bid.id)} />
              {bid.restaurant_name} &mdash; ${bid.price_total.toLocaleString()}
            </label>
          ))}
        </div>
      )}

      {/* Accept confirmation modal */}
      {acceptingId !== null && (
        <div className="modal-overlay" onClick={() => setAcceptingId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Accept this bid?</h2>
            <p>This will create a booking and reject all other bids. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setAcceptingId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleAccept(acceptingId)}>Accept Bid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderBidCard(bid: Bid) {
    return (
      <div key={bid.id} className={`bid-card${bid.status === 'accepted' ? ' accepted' : ''}`}>
        <div className="bid-card-header">
          <h4>{bid.restaurant_name}</h4>
          <span className={`badge badge-${bid.status}`}>{bid.status}</span>
        </div>
        <div className="bid-price">${bid.price_total.toLocaleString()}</div>
        {bid.price_per_person && <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>${bid.price_per_person}/person</p>}
        <div className="bid-card-body">
          <p><strong>Proposal:</strong> {bid.proposal_text}</p>
          {bid.menu_details && <p><strong>Menu:</strong> {bid.menu_details}</p>}
          {bid.space_details && <p><strong>Space:</strong> {bid.space_details}</p>}
          {bid.inclusions && <p><strong>Includes:</strong> {bid.inclusions}</p>}
        </div>
      </div>
    )
  }

  function renderBidFull(bid: Bid, canAccept: boolean) {
    return (
      <div key={bid.id} className={`bid-card${bid.status === 'accepted' ? ' accepted' : ''}`}>
        <div className="bid-card-header">
          <h4>{bid.restaurant_name} {bid.restaurant_cuisine && <span style={{ fontWeight: 400, color: 'var(--color-gray-500)' }}>&middot; {bid.restaurant_cuisine}</span>}</h4>
          <span className={`badge badge-${bid.status}`}>{bid.status}</span>
        </div>
        <div className="bid-price">${bid.price_total.toLocaleString()}</div>
        {bid.price_per_person && <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>${bid.price_per_person}/person</p>}
        <div className="bid-card-body">
          <p>{bid.proposal_text}</p>
          {bid.menu_details && <p><strong>Menu:</strong> {bid.menu_details}</p>}
          {bid.space_details && <p><strong>Space:</strong> {bid.space_details}</p>}
          {bid.inclusions && <p><strong>Includes:</strong> {bid.inclusions}</p>}
        </div>
        {canAccept && bid.status === 'pending' && (
          <div className="bid-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setAcceptingId(bid.id)}>Accept Bid</button>
          </div>
        )}
      </div>
    )
  }
}
