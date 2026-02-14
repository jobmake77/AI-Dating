'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Get username
        supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setUsername(data?.username || null)
          })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUsername(data?.username || null)
          })
      } else {
        setUsername(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const showBackButton = pathname !== '/' && !pathname.startsWith('/login')

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          )}

          <Link href="/" className="font-bold text-xl">
            AI-Dating
          </Link>

          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索内容、标签..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && username ? (
            <>
              <Button asChild>
                <Link href="/create">发布内容</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/u/${username}`}>
                  {user.user_metadata?.avatar_url && (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  {user.user_metadata?.user_name || username}
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                退出
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
