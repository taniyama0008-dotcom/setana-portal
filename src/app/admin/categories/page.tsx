import { supabaseAdmin } from '@/lib/supabase-admin'
import type { CategorySetting } from '@/lib/types'
import CategoriesManager from './CategoriesManager'

export default async function AdminCategoriesPage() {
  const { data } = await supabaseAdmin
    .from('category_settings')
    .select('*')
    .order('category_path')

  const settingsMap = Object.fromEntries(
    ((data ?? []) as CategorySetting[]).map(s => [s.category_path, s]),
  )

  return (
    <main className="p-6 lg:p-8 max-w-[960px]">
      <div className="mb-8">
        <p className="text-[11px] text-[#8a8a8a] tracking-[0.12em] uppercase nav-label mb-1">Admin</p>
        <h1 className="text-[22px] font-bold text-[#1a1a1a]">カテゴリ管理</h1>
        <p className="text-[13px] text-[#5c5c5c] mt-1">
          各カテゴリページのヒーロー画像・グラデーション・リード文を管理します。
        </p>
      </div>
      <CategoriesManager settingsMap={settingsMap} />
    </main>
  )
}
