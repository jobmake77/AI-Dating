import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Use configured site URL to prevent Host Header injection
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
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
        console.error('Error upserting user record')
      }
    }
  }

  return NextResponse.redirect(`${siteUrl}/`)
}
