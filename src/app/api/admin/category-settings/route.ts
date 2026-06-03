import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'

export async function PATCH(req: NextRequest) {
  const role = await getSessionRole()
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    categoryPath: string | undefined
    updates: Record<string, string | null> | undefined
  }
  const { categoryPath, updates } = body

  if (!categoryPath || !updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '必須パラメータが不足しています。' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('category_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('category_path', categoryPath)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath(`/${categoryPath}`)
  revalidatePath('/')

  return NextResponse.json({ success: true })
}
