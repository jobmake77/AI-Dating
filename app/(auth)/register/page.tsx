'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Code2, Github, Mail, Lock, User, Eye, EyeOff, Rocket, Users, Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { signUpWithEmail, signInWithGitHub } from '@/lib/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'

const DECORATION_BLOBS = Array.from({ length: 20 }, (_, index) => ({
  width: 72 + (index % 5) * 38,
  height: 72 + ((index + 2) % 5) * 42,
  top: `${(index * 17) % 100}%`,
  left: `${(index * 23) % 100}%`,
}))

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const features = [
    { icon: Users, label: '加入 52,800+ 开发者社区' },
    { icon: Zap, label: 'AI 驱动的智能匹配' },
    { icon: Shield, label: '安全可靠的交流环境' },
  ]

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError('请先同意服务条款和隐私政策')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('username', username)

    const result = await signUpWithEmail(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(result.message || '注册成功！')
      if (result?.redirect) {
        setTimeout(() => router.push('/'), 1000)
      } else {
        setLoading(false)
      }
    }
  }

  const handleGitHubSignUp = async () => {
    setLoading(true)
    setError(null)
    const result = await signInWithGitHub()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(221, 83%, 53%), hsl(199, 89%, 48%))' }}
      >
        <div className="absolute inset-0 opacity-10">
          {DECORATION_BLOBS.map((blob, index) => (
            <div
              key={`${blob.top}-${blob.left}-${index}`}
              className="absolute rounded-full bg-white/20"
              style={blob}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Rocket className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">开启你的旅程</h2>
            <p className="text-white/70 text-base max-w-sm mx-auto mb-10">
              技术讨论 · 项目分享 · 职业成长
            </p>
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="flex items-center gap-3 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3"
                >
                  <f.icon className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right register form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-mono text-xl font-bold text-foreground">AI-Dating</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-lg font-bold text-foreground mb-1">创建账号</h1>
            <p className="text-xs text-muted-foreground mb-5">加入 AI 开发者社区，开始你的技术之旅</p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                className="h-10 gap-2 text-sm hover:border-primary/30 hover:bg-primary/5"
                onClick={handleGitHubSignUp}
                disabled={loading}
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
              <Button variant="outline" className="h-10 gap-2 text-sm hover:border-accent/30 hover:bg-accent/5" disabled>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">或使用邮箱注册</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 pl-9 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 pl-9 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="密码（至少 8 位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-10 pl-9 pr-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-start gap-2 mt-4">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="agree" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-primary hover:underline">服务条款</Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={!agreed || loading}
                className="w-full h-10 mt-4 text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(262, 83%, 58%))' }}
              >
                <Rocket className="h-4 w-4 mr-1" />
                {loading ? '创建中...' : '创建账号'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            已有账号？{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              立即登录
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
