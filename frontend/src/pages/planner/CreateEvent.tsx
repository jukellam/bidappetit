import { useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../../api/client'
import type { Event, EventType } from '../../types'

const EVENT_TYPES: EventType[] = ['corporate', 'wedding', 'birthday', 'cocktail', 'holiday', 'fundraiser', 'other']
const CITIES = ['San Francisco', 'Chicago']

export function CreateEvent() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', city: CITIES[0], date: '', time: '',
    guest_count: '', budget_min: '', budget_max: '', event_type: EVENT_TYPES[0] as string,
    cuisine_preferences: '', dietary_restrictions: '', vibe: '',
    special_requests: '', duration_hours: '3', bid_deadline: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    try {
      const event = await api.post<Event>('/api/events', {
        title: form.title,
        description: form.description,
        city: form.city,
        date: form.date,
        time: form.time,
        guest_count: parseInt(form.guest_count),
        budget_min: parseFloat(form.budget_min),
        budget_max: parseFloat(form.budget_max),
        event_type: form.event_type,
        bid_deadline: new Date(form.bid_deadline).toISOString(),
        cuisine_preferences: form.cuisine_preferences || null,
        dietary_restrictions: form.dietary_restrictions || null,
        vibe: form.vibe || null,
        special_requests: form.special_requests || null,
        duration_hours: form.duration_hours ? parseFloat(form.duration_hours) : 3,
      })
      navigate(`/planner/events/${event.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Create Event</h1>
        <p>Post your event and let restaurants compete for your business</p>
      </div>

      <div className="steps-indicator">
        {[1, 2, 3].map((s, i) => (
          <span key={s}>
            {i > 0 && <span className={`step-line${step > s - 1 ? ' active' : ''}`} />}
            <span className={`step${step === s ? ' active' : step > s ? ' completed' : ''}`}>{s}</span>
          </span>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        {step === 1 && (
          <>
            <h2 className="section-heading">Event Details</h2>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input className="form-input" value={form.title} onChange={set('title')} placeholder="e.g., Annual Company Dinner" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-select" value={form.city} onChange={set('city')}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-select" value={form.event_type} onChange={set('event_type')}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={set('date')} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" type="time" value={form.time} onChange={set('time')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Guest Count</label>
              <input className="form-input" type="number" value={form.guest_count} onChange={set('guest_count')} placeholder="50" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget Min ($)</label>
                <input className="form-input" type="number" value={form.budget_min} onChange={set('budget_min')} placeholder="3000" />
              </div>
              <div className="form-group">
                <label className="form-label">Budget Max ($)</label>
                <input className="form-input" type="number" value={form.budget_max} onChange={set('budget_max')} placeholder="6000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="Describe your event..." />
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="section-heading">Preferences (Optional)</h2>
            <div className="form-group">
              <label className="form-label">Cuisine Preferences</label>
              <input className="form-input" value={form.cuisine_preferences} onChange={set('cuisine_preferences')} placeholder="e.g., Italian, Japanese, open to all" />
            </div>
            <div className="form-group">
              <label className="form-label">Dietary Restrictions</label>
              <input className="form-input" value={form.dietary_restrictions} onChange={set('dietary_restrictions')} placeholder="e.g., Vegetarian options needed, nut-free" />
            </div>
            <div className="form-group">
              <label className="form-label">Vibe / Atmosphere</label>
              <input className="form-input" value={form.vibe} onChange={set('vibe')} placeholder="e.g., Elegant, Casual, Fun and energetic" />
            </div>
            <div className="form-group">
              <label className="form-label">Special Requests</label>
              <textarea className="form-textarea" value={form.special_requests} onChange={set('special_requests')} placeholder="AV equipment, decorations, photo booth area..." />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (hours)</label>
              <input className="form-input" type="number" step="0.5" value={form.duration_hours} onChange={set('duration_hours')} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="section-heading">Review & Submit</h2>
            <div className="form-group">
              <label className="form-label">Bid Deadline</label>
              <input className="form-input" type="datetime-local" value={form.bid_deadline} onChange={set('bid_deadline')} />
            </div>
            <div className="card" style={{ background: 'var(--color-gray-50)', marginBottom: '20px' }}>
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-label">Title</div><div className="detail-value">{form.title}</div></div>
                <div className="detail-item"><div className="detail-label">City</div><div className="detail-value">{form.city}</div></div>
                <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{form.date} at {form.time}</div></div>
                <div className="detail-item"><div className="detail-label">Guests</div><div className="detail-value">{form.guest_count}</div></div>
                <div className="detail-item"><div className="detail-label">Budget</div><div className="detail-value">${form.budget_min} - ${form.budget_max}</div></div>
                <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{form.event_type}</div></div>
              </div>
              {form.description && <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-700)' }}>{form.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Post Event</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
