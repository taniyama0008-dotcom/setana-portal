export type Section = 'kurashi' | 'shoku' | 'shizen'
export type SpotStatus = 'public' | 'draft' | 'review'
export type ArticleStatus = 'public' | 'draft'
export type Area = 'setana' | 'kitahiyama' | 'taisei'
export type ArticleCategory = 'story' | 'job_feature' | 'iju' | 'course' | 'special' | 'producer' | 'recipe' | 'guide'

export interface Spot {
  id: string
  name: string
  slug: string
  section: Section
  category: string
  area: Area | null
  description: string | null
  address: string | null
  phone: string | null
  business_hours: string | null
  holidays: string | null
  latitude: number | null
  longitude: number | null
  images: string[]
  cover_image: string | null
  status: SpotStatus
  created_at: string
  updated_at: string
  // 宿泊用拡張フィールド（ALTER TABLE spots ADD COLUMN で追加）
  price_range?: string | null
  has_onsen?: boolean | null
  has_meals?: boolean | null
  booking_url?: string | null
  booking_phone?: string | null
  room_count?: number | null
  capacity?: number | null
}

export type EventStatus = 'upcoming' | 'ongoing' | 'finished' | 'cancelled'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  area: Area | null
  location: string | null
  spot_id: string | null
  image_url: string | null
  external_url: string | null
  is_annual: boolean
  status: EventStatus
  created_at: string
  updated_at: string
}

export type ReviewStatus = 'public' | 'hidden'

export interface Review {
  id: string
  spot_id: string
  user_id: string | null
  nickname: string
  rating: number
  text: string | null
  visit_date: string | null
  status: ReviewStatus
  helpful_count: number
  created_at: string
}

export interface ReviewImage {
  id: string
  review_id: string
  image_url: string
  alt_text: string | null
}

export type HousingSupport = 'provided' | 'subsidized' | 'none'
export type KyoryokutaiStatus = 'draft' | 'published'

export interface KyoryokutaiListing {
  id: string
  user_id: string
  slug: string
  title: string
  catchphrase: string | null
  description: string | null
  duties: string | null
  salary_benefits: string | null
  housing_support: HousingSupport
  latitude: number | null
  longitude: number | null
  contact_info: string | null
  application_url: string | null
  photos: string[]
  status: KyoryokutaiStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  section: Section
  category: ArticleCategory
  content: string | null
  excerpt: string | null
  cover_image: string | null
  author_name: string | null
  status: ArticleStatus
  created_at: string
  updated_at: string
}
