import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const baseUrl = 'https://www.setana.life'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: spots }, { data: kyoryokutai }] = await Promise.all([
    supabase
      .from('spots')
      .select('slug, created_at, updated_at')
      .eq('status', 'public'),
    supabase
      .from('kyoryokutai_listings')
      .select('slug, published_at, updated_at')
      .eq('status', 'published'),
  ])

  const spotEntries: MetadataRoute.Sitemap = (spots ?? []).map((spot) => ({
    url: `${baseUrl}/spot/${spot.slug}`,
    lastModified: new Date(spot.updated_at ?? spot.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const kyoryokutaiEntries: MetadataRoute.Sitemap = (kyoryokutai ?? []).map((k) => ({
    url: `${baseUrl}/kyoryokutai/${k.slug}`,
    lastModified: new Date(k.updated_at ?? k.published_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    // トップ
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },

    // 旅する
    { url: `${baseUrl}/travel`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/travel/gourmet`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/travel/nature`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/travel/onsen`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/travel/stay`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/travel/access`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },

    // 暮らす
    { url: `${baseUrl}/life`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/life/work`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/life/living`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/life/migration`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // 協力隊
    { url: `${baseUrl}/kyoryokutai`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...kyoryokutaiEntries,

    // スポット個別
    ...spotEntries,
  ]
}
