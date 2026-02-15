import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('Auth callback received, code:', code ? 'present' : 'missing')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      console.log('User authenticated:', data.user.id)

      // 使用 upsert 创建或更新用户记录
      console.log('Upserting user record')
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          username: data.user.user_metadata.user_name || data.user.email?.split('@')[0] || 'user',
          email: data.user.email,
          avatar: data.user.user_metadata.avatar_url,
          github_url: data.user.user_metadata.html_url,
          role: 'user',
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (upsertError) {
        console.error('Error upserting user:', upsertError)
      } else {
        console.log('User record upserted successfully')
      }
    }
  }

  // 重定向到首页
  console.log('Redirecting to home page')
  return NextResponse.redirect(`${origin}/`)
}
