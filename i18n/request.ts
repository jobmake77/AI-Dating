import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { defaultLocale, isLocale, localeCookieName, type Locale } from '@/i18n/config'

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(localeCookieName)?.value
  let locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return locale
    }

    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('locale')
      .eq('user_id', user.id)
      .maybeSingle()

    if (isLocale(preferences?.locale)) {
      locale = preferences.locale
    }
  } catch (error) {
    console.error('Failed to resolve request locale:', error)
  }

  return locale
}
