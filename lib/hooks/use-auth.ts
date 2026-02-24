'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  username: string | null
  role: string | null
  isLoading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    username: null,
    role: null,
    isLoading: true,
  })

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    // 获取初始 session
    const initAuth = async () => {
      try {
        // 添加超时处理，防止请求挂起
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        })

        const sessionPromise = supabase.auth.getSession()

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (!mounted) return

        if (session?.user) {
          // 获取 username 和 role
          try {
            const { data } = await supabase
              .from('users')
              .select('username, role')
              .eq('id', session.user.id)
              .single()

            if (!mounted) return
            setState({
              user: session.user,
              username: data?.username || null,
              role: data?.role || null,
              isLoading: false,
            })
          } catch (error) {
            if (!mounted) return
            setState({
              user: session.user,
              username: null,
              role: null,
              isLoading: false,
            })
          }
        } else {
          setState({
            user: null,
            username: null,
            role: null,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('[useAuth] Failed to get session:', error)
        if (!mounted) return
        setState({
          user: null,
          username: null,
          role: null,
          isLoading: false,
        })
      }
    }

    initAuth()

    // 监听认证变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      if (session?.user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('username, role')
            .eq('id', session.user.id)
            .single()

          if (!mounted) return
          setState({
            user: session.user,
            username: data?.username || null,
            role: data?.role || null,
            isLoading: false,
          })
        } catch (error) {
          if (!mounted) return
          setState({
            user: session.user,
            username: null,
            role: null,
            isLoading: false,
          })
        }
      } else {
        setState({
          user: null,
          username: null,
          role: null,
          isLoading: false,
        })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return state
}
