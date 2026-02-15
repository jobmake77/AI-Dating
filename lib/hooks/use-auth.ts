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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      if (session?.user) {
        // 获取 username 和 role
        supabase
          .from('users')
          .select('username, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (!mounted) return
            setState({
              user: session.user,
              username: data?.username || null,
              role: data?.role || null,
              isLoading: false,
            })
          })
          .catch(() => {
            if (!mounted) return
            setState({
              user: session.user,
              username: null,
              role: null,
              isLoading: false,
            })
          })
      } else {
        setState({
          user: null,
          username: null,
          role: null,
          isLoading: false,
        })
      }
    })

    // 监听认证变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      if (session?.user) {
        supabase
          .from('users')
          .select('username, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (!mounted) return
            setState({
              user: session.user,
              username: data?.username || null,
              role: data?.role || null,
              isLoading: false,
            })
          })
          .catch(() => {
            if (!mounted) return
            setState({
              user: session.user,
              username: null,
              role: null,
              isLoading: false,
            })
          })
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
