import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    generation_id: string
    title: string
    description?: string
    is_public: boolean
    tags: string[]
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: gen } = await supabase
    .from('generations')
    .select('*')
    .eq('id', body.generation_id)
    .eq('user_id', user.id)
    .single()

  if (!gen) return NextResponse.json({ error: 'Generation not found' }, { status: 404 })

  const { data: project, error } = await supabase
    .from('portfolio_projects')
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      result_url: (gen as Record<string, unknown>).result_url as string,
      studio: (gen as Record<string, unknown>).studio as string,
      prompt: (gen as Record<string, unknown>).prompt as string,
      is_public: body.is_public,
      tags: body.tags,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project, url: `/portfolio/${(project as Record<string, unknown>).id}` })
}
