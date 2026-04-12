import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const baseUrl = 'https://setana-portal.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: spots } = await supabase
    .from('spots')
    .select('slug, created_at, updated_at')
    .eq('status', 'public')

  const spotEntries: MetadataRoute.Sitemap = (spots ?? []).map((spot) => ({
    url: `${baseUrl}/spot/${spot.slug}`,
    lastModified: new Date(spot.updated_at ?? spot.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
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

    // スポット個別
    ...spotEntries,
  ]
}
