export type UserType = 'planner' | 'restaurant'
export type EventStatus = 'open' | 'booked' | 'cancelled' | 'expired'
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'
export type EventType = 'corporate' | 'wedding' | 'birthday' | 'cocktail' | 'holiday' | 'fundraiser' | 'other'

export interface User {
  id: number
  email: string
  name: string
  user_type: UserType
  created_at: string
  restaurant_profile?: {
    id: number
    name: string
    city: string
    cuisine_type: string
    price_range: string
  } | null
}

export interface Event {
  id: number
  planner_id: number
  title: string
  description: string
  city: string
  date: string
  time: string
  duration_hours: number | null
  guest_count: number
  budget_min: number
  budget_max: number
  bid_deadline: string
  status: EventStatus
  event_type: EventType
  cuisine_preferences: string | null
  dietary_restrictions: string | null
  vibe: string | null
  special_requests: string | null
  created_at: string
  bid_count: number
  bids?: Bid[]
  my_bid?: Bid | null
}

export interface Bid {
  id: number
  event_id: number
  restaurant_id: number
  price_total: number
  price_per_person: number | null
  proposal_text: string
  menu_details: string | null
  space_details: string | null
  inclusions: string | null
  status: BidStatus
  created_at: string
  restaurant_name?: string | null
  restaurant_cuisine?: string | null
}

export interface Booking {
  id: number
  event_id: number
  bid_id: number
  planner_id: number
  restaurant_id: number
  status: BookingStatus
  confirmed_at: string
  event_title?: string | null
  restaurant_name?: string | null
  event_date?: string | null
  bid_price?: number | null
}
