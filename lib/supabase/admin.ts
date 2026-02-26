import { createClient } from '@supabase/supabase-js'

// 用 service role key，绕过 RLS，仅在 API 路由中使用
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
