export type Section = 'kurashi' | 'shoku' | 'shizen'
export type SpotStatus = 'public' | 'draft' | 'review'
export type ArticleStatus = 'public' | 'draft'
export type Area = '瀬棚区' | '北檜山区' | '大成区'
export type ArticleCategory = 'story' | 'job_feature' | 'iju' | 'course' | 'special' | 'producer' | 'recipe' | 'guide'

export interface Spot {
  id: string
  name: string
  slug: string
  section: Section
  category: string
  area: Area
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
