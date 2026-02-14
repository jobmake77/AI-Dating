'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfile {
  username: string
}

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // State management
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user with error handling
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          throw authError
        }

        setUser(user)

        if (user) {
          // Get username with error handling
          const { data, error: profileError } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Failed to fetch username:', profileError)
            // Don't throw - username is not critical for header display
            setUsername(null)
          } else {
            setUsername(data?.username || null)
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load user')
        console.error('Auth initialization error:', error)
        setError(error)
        // Don't show toast on initial load - just log
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        try {
          const { data, error: profileError } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Failed to fetch username:', profileError)
            setUsername(null)
          } else {
            setUsername(data?.username || null)
          }
        } catch (err) {
          console.error('Error fetching username:', err)
          setUsername(null)
        }
      } else {
        setUsername(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    // Prevent multiple clicks
    if (isSigningOut) return

    try {
      setIsSigningOut(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Success feedback
      toast({
        title: '已退出登录',
        description: '您已成功退出账号',
      })

      router.push('/')
      router.refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('退出登录失败')
      console.error('Sign out error:', error)

      // Show error to user
      toast({
        variant: 'destructive',
        title: '退出失败',
        description: error.message || '请稍后重试',
      })
    } finally {
      setIsSigningOut(false)
    }
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
              aria-label="返回上一页"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          )}

          <Link href="/" className="font-bold text-xl" aria-label="返回首页">
            AI-Dating
          </Link>

          <div className="relative w-96 hidden md:block">
            <label htmlFor="search-input" className="sr-only">
              搜索内容和标签
            </label>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="search-input"
              placeholder="搜索内容、标签..."
              className="pl-10"
              aria-label="搜索"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Loading State - Only show when no data */}
          {isLoading && !user ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          ) : user && username ? (
            <>
              <Button asChild>
                <Link href="/create">发布内容</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/u/${username}`} aria-label={`查看 ${username} 的主页`}>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={`${username} 的头像`}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  ) : (
                    <User className="w-6 h-6 mr-2" aria-hidden="true" />
                  )}
                  {user.user_metadata?.user_name || username}
                </Link>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                disabled={isSigningOut}
                aria-label="退出登录"
              >
                {isSigningOut ? '退出中...' : '退出'}
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
