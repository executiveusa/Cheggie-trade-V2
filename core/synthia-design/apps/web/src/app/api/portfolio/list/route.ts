import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const studio = searchParams.get('studio') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '0')
  const limit = parseInt(searchParams.get('limit') || '12')

  // Placeholder — in production query Supabase portfolio_projects
  // const supabase = await createServerSupabaseClient()
  // let query = supabase.from('portfolio_projects').select('*').eq('is_public', true)
  // if (studio !== 'all') query = query.eq('studio', studio)
  // query = query.order(sort === 'remixed' ? 'remix_count' : 'created_at', { ascending: false })
  // const { data } = await query.range(page * limit, (page + 1) * limit - 1)

  return NextResponse.json({
    projects: [],
    hasMore: false,
    meta: { studio, sort, page, limit },
  })
}
