import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'

async function testAuth() {
  'use server'

  const supabase = await createClient()

  console.log('Testing GitHub OAuth...')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('OAuth Error:', error)
    throw new Error(JSON.stringify(error))
  }

  console.log('OAuth Data:', data)

  if (data.url) {
    const { redirect } = await import('next/navigation')
    redirect(data.url)
  }
}

export default async function TestAuthPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const supabase = await createClient()

  // 测试连接
  const { error: testError } = await supabase
    .from('users')
    .select('count')
    .limit(1)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>认证测试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Supabase URL:</strong><br />
              {process.env.NEXT_PUBLIC_SUPABASE_URL}
            </p>
            <p className="text-sm">
              <strong>Site URL:</strong><br />
              {process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
            </p>
            <p className="text-sm">
              <strong>数据库连接:</strong><br />
              {testError ? (
                <span className="text-red-500">❌ 失败: {testError.message}</span>
              ) : (
                <span className="text-green-500">✅ 成功</span>
              )}
            </p>
          </div>

          <form action={testAuth}>
            <Button type="submit" className="w-full">
              测试 GitHub 登录
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            如果点击后出现错误，请查看浏览器控制台
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
