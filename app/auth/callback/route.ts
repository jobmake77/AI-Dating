import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 检查用户是否已存在于数据库
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // 如果用户不存在，创建新用户
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username: data.user.user_metadata.user_name || data.user.email?.split('@')[0] || 'user',
            email: data.user.email,
            avatar: data.user.user_metadata.avatar_url,
            github_url: data.user.user_metadata.html_url,
            role: 'user',
          })

        if (insertError) {
          console.error('Error creating user:', insertError)
        }
      }
    }
  }

  // 重定向到首页
  return NextResponse.redirect(`${origin}/`)
}
