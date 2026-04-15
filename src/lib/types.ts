export type Section = 'kurashi' | 'shoku' | 'shizen'
export type SpotStatus = 'public' | 'draft' | 'review'
export type ArticleStatus = 'public' | 'draft'
export type Area = 'setana' | 'kitahiyama' | 'taisei'        // events テーブルの area 値
export type SpotArea = '瀬棚区' | '北檜山区' | '大成区'         // spots テーブルの area 値
export type ArticleCategory = 'story' | 'job_feature' | 'iju' | 'course' | 'special' | 'producer' | 'recipe' | 'guide'

export interface Spot {
  id: string
  name: string
  slug: string
  section: Section
  category: string
  area: SpotArea | null
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

export interface SpotImage {
  id: string
  spot_id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  created_at: string
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

// ─── 通報システム ───────────────────────────────────────────
export type ReportCategory =
  | 'road' | 'streetlight' | 'park' | 'snow' | 'other'
  | 'shop_closed' | 'shop_hours' | 'shop_crowded' | 'weather' | 'event_info' | 'other_info'

export type ReportType   = 'infrastructure' | 'realtime_info'
export type ReportStatus = 'received' | 'confirmed' | 'in_progress' | 'resolved' | 'rejected'
export type CoinReason   = 'report_infra' | 'report_info' | 'photo_bonus' | 'review' | 'helpful_bonus' | 'redeem'

export interface Report {
  id: string
  report_number: string
  user_id: string | null
  line_user_id: string | null
  reporter_name: string | null
  category: ReportCategory
  report_type: ReportType
  description: string | null
  spot_id: string | null
  spot_name: string | null
  photo_url: string | null
  latitude: number | null
  longitude: number | null
  status: ReportStatus
  is_public: boolean
  public_message: string | null
  forwarded_to: string | null
  forwarded_at: string | null
  admin_note: string | null
  resolved_at: string | null
  coins_awarded: number
  created_at: string
  updated_at: string
}

export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  reason: CoinReason
  reference_id: string | null
  created_at: string
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
