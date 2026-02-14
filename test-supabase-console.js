// 在浏览器控制台运行这段代码来测试 Supabase 连接

// 1. 检查环境变量
console.log('=== 环境变量检查 ===')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置')

// 2. 测试 Supabase 客户端
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 环境变量未设置！')
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  console.log('=== 测试 GitHub OAuth ===')

  supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  }).then(({ data, error }) => {
    if (error) {
      console.error('❌ OAuth 错误:', error)
    } else {
      console.log('✅ OAuth URL:', data.url)
      console.log('如果看到 URL，说明配置正确')
    }
  })
}
