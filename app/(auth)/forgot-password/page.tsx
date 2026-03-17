'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Code2, Mail, ArrowLeft, KeyRound, Send, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendPasswordReset } from '@/lib/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'use-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('authPages.forgotPassword')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', email)

    const result = await sendPasswordReset(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-mono text-xl font-bold text-foreground">AI-Dating</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                    <KeyRound className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <h1 className="text-lg font-bold text-foreground text-center mb-1">{t('title')}</h1>
                <p className="text-xs text-muted-foreground text-center mb-5">{t('description')}</p>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 pl-9 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(199, 89%, 48%))' }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {loading ? t('submitting') : t('submit')}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{t('successTitle')}</h2>
                <p className="text-xs text-muted-foreground mb-1">{t('successDescription')}</p>
                <p className="text-sm font-medium text-foreground mb-4 font-mono">{email}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t('resendHint')}{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-primary hover:underline"
                  >
                    {t('resend')}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-4">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('backToLogin')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
