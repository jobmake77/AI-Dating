import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidUuid } from '@/lib/utils/is-valid-uuid'

// 内存限流：IP -> { count, resetAt }
// 注意：多实例部署时需换用 Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  'POST:/api/agent/posts': { max: 10, windowMs: 60_000 },
  'GET:/api/agent/posts':  { max: 60, windowMs: 60_000 },
  'POST:/api/admin':       { max: 20, windowMs: 60_000 },
}
const DEFAULT_API_LIMIT = { max: 60, windowMs: 60_000 }

function rewriteToNotFound(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/_not-found'
  url.search = ''
  return NextResponse.rewrite(url)
}

async function resolveMissingContentRoute(request: NextRequest, supabase: ReturnType<typeof createServerClient>) {
  const { pathname } = request.nextUrl

  if (process.env.NODE_ENV === 'production' && (pathname === '/test-auth' || pathname === '/test-ui')) {
    return rewriteToNotFound(request)
  }

  const postMatch = pathname.match(/^\/post\/([^/]+)$/)
  if (postMatch) {
    const id = decodeURIComponent(postMatch[1])

    if (!isValidUuid(id)) {
      return rewriteToNotFound(request)
    }

    const { data } = await supabase
      .from('contents')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (!data) {
      return rewriteToNotFound(request)
    }
  }

  const editMatch = pathname.match(/^\/edit\/([^/]+)$/)
  if (editMatch) {
    const id = decodeURIComponent(editMatch[1])

    if (!isValidUuid(id)) {
      return rewriteToNotFound(request)
    }

    const { data } = await supabase
      .from('contents')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (!data) {
      return rewriteToNotFound(request)
    }
  }

  const userMatch = pathname.match(/^\/u\/([^/]+)(?:\/(?:followers|following))?$/)
  if (userMatch) {
    const username = decodeURIComponent(userMatch[1])
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (!data) {
      return rewriteToNotFound(request)
    }
  }

  const eventMatch = pathname.match(/^\/events\/([^/]+)$/)
  if (eventMatch && eventMatch[1] !== 'create') {
    const id = decodeURIComponent(eventMatch[1])

    if (!isValidUuid(id)) {
      return rewriteToNotFound(request)
    }

    const { data } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!data) {
      return rewriteToNotFound(request)
    }
  }

  const communityMatch = pathname.match(/^\/communities\/([^/]+)(?:\/.*)?$/)
  if (communityMatch && communityMatch[1] !== 'create') {
    const slug = decodeURIComponent(communityMatch[1])
    const { data } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data) {
      return rewriteToNotFound(request)
    }
  }

  return null
}

function getRateLimit(method: string, pathname: string) {
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (`${method}:${pathname}`.startsWith(pattern)) return limit
  }
  return DEFAULT_API_LIMIT
}

function checkRateLimit(ip: string, method: string, pathname: string): boolean {
  const limit = getRateLimit(method, pathname)
  const mapKey = `${ip}:${method}:${pathname}`
  const now = Date.now()
  const entry = rateLimitMap.get(mapKey)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(mapKey, { count: 1, resetAt: now + limit.windowMs })
    return true
  }
  if (entry.count >= limit.max) return false
  entry.count++
  return true
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API 路由限流
  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(ip, request.method, pathname)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  }

  // Admin 路由：边缘鉴权
  if (pathname.startsWith('/admin')) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return response
  }

  // 其他路由：刷新 Supabase session
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const missingRouteResponse = await resolveMissingContentRoute(request, supabase)
  if (missingRouteResponse) {
    return missingRouteResponse
  }

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
