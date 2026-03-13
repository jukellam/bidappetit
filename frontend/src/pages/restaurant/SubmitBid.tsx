import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { api } from '../../api/client'
import type { Event, Bid } from '../../types'

export function SubmitBid() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    price_total: '', price_per_person: '', proposal_text: '',
    menu_details: '', space_details: '', inclusions: '',
  })

  useEffect(() => {
    api.get<Event>(`/api/events/${id}`).then(ev => {
      setEvent(ev)
      if (ev.my_bid) {
        setForm({
          price_total: String(ev.my_bid.price_total),
          price_per_person: ev.my_bid.price_per_person ? String(ev.my_bid.price_per_person) : '',
          proposal_text: ev.my_bid.proposal_text,
          menu_details: ev.my_bid.menu_details ?? '',
          space_details: ev.my_bid.space_details ?? '',
          inclusions: ev.my_bid.inclusions ?? '',
        })
      }
    }).finally(() => setLoading(false))
  }, [id])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const body = {
      price_total: Number(form.price_total) || 0,
      price_per_person: form.price_per_person ? Number(form.price_per_person) || 0 : null,
      proposal_text: form.proposal_text,
      menu_details: form.menu_details || null,
      space_details: form.space_details || null,
      inclusions: form.inclusions || null,
    }
    try {
      if (event?.my_bid) {
        await api.put<Bid>(`/api/bids/${event.my_bid.id}`, body)
      } else {
        await api.post<Bid>(`/api/events/${id}/bids`, body)
      }
      navigate(`/restaurant/events/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!event) return <div className="error-message">Event not found</div>

  const isEdit = !!event.my_bid

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit' : 'Submit'} Bid</h1>
        <p>for {event.title}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Total Price ($) *</label>
            <input className="form-input" type="number" required value={form.price_total} onChange={set('price_total')} placeholder="5000" />
          </div>
          <div className="form-group">
            <label className="form-label">Price Per Person ($)</label>
            <input className="form-input" type="number" value={form.price_per_person} onChange={set('price_per_person')} placeholder="100" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Proposal *</label>
          <textarea className="form-textarea" required value={form.proposal_text} onChange={set('proposal_text')} placeholder="Tell the planner why your venue is perfect for their event..." style={{ minHeight: '120px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Menu Details</label>
          <textarea className="form-textarea" value={form.menu_details} onChange={set('menu_details')} placeholder="Describe your proposed menu..." />
        </div>
        <div className="form-group">
          <label className="form-label">Space Details</label>
          <textarea className="form-textarea" value={form.space_details} onChange={set('space_details')} placeholder="Describe the space you'd use for this event..." />
        </div>
        <div className="form-group">
          <label className="form-label">Inclusions</label>
          <textarea className="form-textarea" value={form.inclusions} onChange={set('inclusions')} placeholder="What's included (drinks, decorations, AV, etc.)..." />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn" onClick={() => navigate(`/restaurant/events/${id}`)}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Update' : 'Submit'} Bid</button>
        </div>
      </form>
    </div>
  )
}
