import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
      // 先检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (existingUser) {
        // 已存在：只更新非敏感字段，不覆盖 role
        await supabase
          .from('users')
          .update({
            username: data.user.user_metadata.user_name || data.user.email?.split('@')[0] || 'user',
            email: data.user.email,
            avatar: data.user.user_metadata.avatar_url,
            github_url: data.user.user_metadata.html_url,
          })
          .eq('id', data.user.id)
      } else {
        // 首次登录：插入完整记录，role 默认 'user'
        await supabase.from('users').insert({
          id: data.user.id,
          username: data.user.user_metadata.user_name || data.user.email?.split('@')[0] || 'user',
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
