'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)
  const router = useRouter()

  const handleSetAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Refresh the page after 2 seconds to update the auth state
        setTimeout(() => {
          router.push('/admin/users')
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      setResult({ error: 'Failed to call API' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>设置管理员权限</CardTitle>
          <CardDescription>
            点击下面的按钮将当前登录用户设置为管理员
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSetAdmin}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? '设置中...' : '设置为管理员'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 text-green-900 border border-green-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}>
              {result.success ? (
                <div>
                  <p className="font-semibold">✅ {result.message}</p>
                  <p className="text-sm mt-2">正在跳转到管理后台...</p>
                </div>
              ) : (
                <p className="font-semibold">❌ {result.error}</p>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>说明：</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>此页面仅用于初始设置</li>
              <li>需要先登录才能使用</li>
              <li>设置成功后会自动跳转到管理后台</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
