import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Booking } from '../../types'

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = () => {
    api.get<Booking[]>('/api/bookings').then(setBookings).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/api/bookings/${id}/cancel`)
      fetchBookings()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to cancel')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div>
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Your confirmed and past bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>Accept a bid on one of your events to create a booking</p>
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="booking-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{b.event_title}</h3>
              <span className={`badge badge-${b.status}`}>{b.status}</span>
            </div>
            <div className="event-meta">
              <span>{b.restaurant_name}</span>
              <span>{b.event_date}</span>
              {b.bid_price && <span>${b.bid_price.toLocaleString()}</span>}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-sm" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                {expandedId === b.id ? 'Hide Details' : 'View Details'}
              </button>
              {b.status === 'confirmed' && (
                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel Booking</button>
              )}
            </div>
            {expandedId === b.id && (
              <div className="card" style={{ marginTop: '12px', background: 'var(--color-gray-50)' }}>
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Booking ID</div><div className="detail-value">#{b.id}</div></div>
                  <div className="detail-item"><div className="detail-label">Confirmed</div><div className="detail-value">{new Date(b.confirmed_at).toLocaleDateString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Restaurant</div><div className="detail-value">{b.restaurant_name}</div></div>
                  <div className="detail-item"><div className="detail-label">Total Price</div><div className="detail-value">${b.bid_price?.toLocaleString()}</div></div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
