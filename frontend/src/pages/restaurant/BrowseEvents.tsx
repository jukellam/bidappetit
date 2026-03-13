import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { Event, EventType } from '../../types'

const EVENT_TYPES: EventType[] = ['corporate', 'wedding', 'birthday', 'cocktail', 'holiday', 'fundraiser', 'other']
const CITIES = ['', 'San Francisco', 'Chicago']

function deadlineCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

export function BrowseEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', event_type: '', budget_max: '' })

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('status', 'open')
    if (filters.city) params.set('city', filters.city)
    if (filters.event_type) params.set('event_type', filters.event_type)
    if (filters.budget_max) params.set('budget_max', filters.budget_max)

    api.get<Event[]>(`/api/events?${params}`).then(setEvents).finally(() => setLoading(false))
  }, [filters])

  const setFilter = (field: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setFilters(f => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      <div className="page-header">
        <h1>Browse Events</h1>
        <p>Find events that match your restaurant</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">City</label>
          <select className="form-select" value={filters.city} onChange={setFilter('city')}>
            <option value="">All Cities</option>
            {CITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Event Type</label>
          <select className="form-select" value={filters.event_type} onChange={setFilter('event_type')}>
            <option value="">All Types</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Max Budget</label>
          <input className="form-input" type="number" placeholder="Any" value={filters.budget_max} onChange={setFilter('budget_max')} />
        </div>
      </div>

      {loading ? <div className="loading">Loading...</div> : events.length === 0 ? (
        <div className="empty-state">
          <h3>No events found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        events.map(event => (
          <Link key={event.id} to={`/restaurant/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="event-card">
              <div className="event-card-header">
                <h3>{event.title}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="countdown">{deadlineCountdown(event.bid_deadline)}</span>
                  <span className="badge badge-open">{event.bid_count} bid{event.bid_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="event-card-body">{event.description.slice(0, 150)}...</div>
              <div className="event-meta">
                <span>{event.city}</span>
                <span>{event.date}</span>
                <span>{event.guest_count} guests</span>
                <span>${event.budget_min.toLocaleString()} - ${event.budget_max.toLocaleString()}</span>
                <span>{event.event_type}</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
