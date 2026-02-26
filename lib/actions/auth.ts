'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '请输入邮箱和密码' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user exists in database
  if (data.user) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single()

    // If user doesn't exist, create user record
    if (!existingUser) {
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7)

      await supabase.from('users').insert({
        id: data.user.id,
        username,
        email: data.user.email,
        role: 'user',
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '请输入邮箱和密码' }
  }

  if (password.length < 6) {
    return { error: '密码至少需要 6 个字符' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // 在开发环境下，可以设置为不需要邮箱验证
      data: {
        email_confirm: false,
      },
    },
  })

  if (error) {
    // 改进错误消息
    if (error.message.includes('Email rate limit exceeded')) {
      return { error: '发送邮件过于频繁，请稍后再试（每小时限制 3 封）' }
    }
    if (error.message.includes('Error sending confirmation email')) {
      return {
        error: '邮件发送失败。建议：1) 在 Supabase 中关闭邮箱验证 2) 配置自定义 SMTP',
        warning: '用户已创建，但验证邮件发送失败。你可以在 Supabase Dashboard 中手动验证用户。'
      }
    }
    if (error.message.includes('User already registered')) {
      return { error: '该邮箱已被注册，请直接登录' }
    }
    return { error: error.message }
  }

  // 检查是否需要邮箱验证
  if (data.user && !data.session) {
    return {
      success: true,
      message: '注册成功！请检查邮箱验证链接。如果没有收到邮件，请检查垃圾邮件文件夹。'
    }
  }

  // 如果不需要邮箱验证，创建用户记录并直接登录
  if (data.user && data.session) {
    const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7)

    await supabase.from('users').insert({
      id: data.user.id,
      username,
      email: data.user.email,
      role: 'user',
    })

    return {
      success: true,
      message: '注册成功！正在跳转...',
      redirect: true
    }
  }

  return { success: true, message: '注册成功！' }
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) return { error: '请输入邮箱' }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    const msg = error.message
    if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
      return { error: '邮件发送过于频繁，请稍后再试' }
    }
    if (msg.includes('Error sending') || msg.includes('smtp') || msg.includes('email')) {
      return { error: 'SMTP 未配置，邮件无法发送。请在 Supabase Dashboard → Project Settings → Auth → SMTP 配置邮件服务，或联系管理员。', hint: 'smtp_error' }
    }
    return { error: msg }
  }
  return { success: true, message: '重置链接已发送，请检查邮箱（含垃圾邮件）' }
}

export async function signInWithGitHub() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: '未获取到 OAuth URL' }
}
