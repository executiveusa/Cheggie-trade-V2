import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { project_id } = await req.json() as { project_id: string }

  const supabase = await createServerSupabaseClient()

  const { data: project } = await supabase
    .from('portfolio_projects')
    .select('prompt, remix_count')
    .eq('id', project_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase
    .from('portfolio_projects')
    .update({ remix_count: ((project as Record<string, unknown>).remix_count as number) + 1 })
    .eq('id', project_id)

  return NextResponse.json({ prompt: (project as Record<string, unknown>).prompt })
}
