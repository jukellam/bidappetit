import type { Bid } from '../types'

interface Props {
  bid: Bid
  compact?: boolean
  onAccept?: (bidId: number) => void
}

export function BidCard({ bid, compact = false, onAccept }: Props) {
  return (
    <div className={`bid-card${bid.status === 'accepted' ? ' accepted' : ''}`}>
      <div className="bid-card-header">
        <h4>
          {bid.restaurant_name}
          {!compact && bid.restaurant_cuisine && (
            <span style={{ fontWeight: 400, color: 'var(--color-gray-500)' }}>&middot; {bid.restaurant_cuisine}</span>
          )}
        </h4>
        <span className={`badge badge-${bid.status}`}>{bid.status}</span>
      </div>
      <div className="bid-price">${bid.price_total.toLocaleString()}</div>
      {bid.price_per_person && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>${bid.price_per_person}/person</p>
      )}
      <div className="bid-card-body">
        <p>{compact && <strong>Proposal: </strong>}{bid.proposal_text}</p>
        {bid.menu_details && <p><strong>Menu:</strong> {bid.menu_details}</p>}
        {bid.space_details && <p><strong>Space:</strong> {bid.space_details}</p>}
        {bid.inclusions && <p><strong>Includes:</strong> {bid.inclusions}</p>}
      </div>
      {onAccept && bid.status === 'pending' && (
        <div className="bid-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onAccept(bid.id)}>Accept Bid</button>
        </div>
      )}
    </div>
  )
}
