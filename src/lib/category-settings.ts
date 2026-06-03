import { supabase } from './supabase'
import type { CategorySetting } from './types'

export async function getCategorySetting(path: string): Promise<CategorySetting | null> {
  const { data } = await supabase
    .from('category_settings')
    .select('*')
    .eq('category_path', path)
    .maybeSingle()
  return data
}

export async function getAllCategorySettings(): Promise<Record<string, CategorySetting>> {
  const { data } = await supabase
    .from('category_settings')
    .select('*')
  if (!data) return {}
  return Object.fromEntries((data as CategorySetting[]).map(s => [s.category_path, s]))
}

export function buildGradient(
  setting: CategorySetting | null | undefined,
  fallbackFrom: string,
  fallbackVia: string,
  fallbackTo: string,
): string {
  const from = setting?.hero_gradient_from ?? fallbackFrom
  const via  = setting?.hero_gradient_via  ?? fallbackVia
  const to   = setting?.hero_gradient_to   ?? fallbackTo
  return `linear-gradient(135deg, ${from}, ${via}, ${to})`
}
