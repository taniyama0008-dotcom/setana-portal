import { createClient } from '@supabase/supabase-js'

// service_role キーが設定されていればRLSをバイパス
// Supabaseダッシュボード > Project Settings > API > service_role から取得して
// .env.local に SUPABASE_SERVICE_ROLE_KEY=... として追加してください
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
