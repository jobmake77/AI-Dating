'use client'

import type { ReactNode } from 'react'
import { IntlProvider } from 'use-intl'

interface AppIntlProviderProps {
  children: ReactNode
  locale: string
  messages: Record<string, unknown>
}

export function AppIntlProvider({ children, locale, messages }: AppIntlProviderProps) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}
