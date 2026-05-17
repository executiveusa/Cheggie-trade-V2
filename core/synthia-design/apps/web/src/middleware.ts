import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require starter tier or above
const STARTER_ROUTES = [
  '/studios/cinema',
  '/studios/video',
  '/studios/lipsync',
  '/studios/marketing',
  '/studios/workflow',
  '/brain',
]

// Routes that require operator tier
const OPERATOR_ROUTES = ['/operator']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/u/') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/api/creem-webhook') ||
    pathname.startsWith('/api/whatsapp') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')

  if (isPublic) return NextResponse.next()

  const response = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) =>
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth', request.url))

  // Tier enforcement for protected studio/operator routes
  const needsStarterPlus = STARTER_ROUTES.some(r => pathname.startsWith(r))
  const needsOperator = OPERATOR_ROUTES.some(r => pathname.startsWith(r))

  if (needsStarterPlus || needsOperator) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    const tier = (profile?.tier as string) || 'free'

    if (needsOperator && tier !== 'operator') {
      return NextResponse.redirect(new URL('/pricing?upgrade=operator', request.url))
    }

    if (needsStarterPlus && tier === 'free') {
      return NextResponse.redirect(new URL('/pricing?upgrade=1', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
