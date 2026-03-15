import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function normalizeUsername(value?: string | null) {
  return value
    ?.trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, 30)
}

async function ensureUniqueUsername(
  supabase: Awaited<ReturnType<typeof createClient>>,
  preferredUsername?: string | null,
  fallbackEmail?: string | null,
) {
  const emailPrefix = fallbackEmail?.split('@')[0]
  const baseUsername = normalizeUsername(preferredUsername) || normalizeUsername(emailPrefix) || 'user'
  const trimmedBase = baseUsername.slice(0, 24)

  const candidates = [
    baseUsername,
    `${trimmedBase}_${Math.random().toString(36).slice(2, 8)}`,
    `${trimmedBase}_${Math.random().toString(36).slice(2, 8)}`,
    `${trimmedBase}_${Math.random().toString(36).slice(2, 8)}`,
  ]

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', candidate)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return candidate
    }
  }

  return `user_${Math.random().toString(36).slice(2, 10)}`
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  // Use configured site URL to prevent Host Header injection
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      const requestedUsername =
        normalizeUsername(data.user.user_metadata.user_name) ||
        normalizeUsername(data.user.user_metadata.username) ||
        data.user.email?.split('@')[0] ||
        'user'

      // 先检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role, username')
        .eq('id', data.user.id)
        .single()

      if (existingUser) {
        // 已存在：只更新资料，不覆盖角色和自定义用户名
        await supabase
          .from('users')
          .update({
            email: data.user.email,
            avatar: data.user.user_metadata.avatar_url,
            github_url: data.user.user_metadata.html_url,
          })
          .eq('id', data.user.id)
      } else {
        const username = await ensureUniqueUsername(supabase, requestedUsername, data.user.email)

        // 首次登录：插入完整记录，role 默认 'user'
        await supabase.from('users').insert({
          id: data.user.id,
          username,
          email: data.user.email,
          avatar: data.user.user_metadata.avatar_url,
          github_url: data.user.user_metadata.html_url,
          role: 'user',
        })
      }
    }
  }

  return NextResponse.redirect(`${siteUrl}${next}`)
}
