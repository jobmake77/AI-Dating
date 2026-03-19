'use client'

/**
 * Skip Link Component
 * Allows keyboard users to skip to main content
 * WCAG 2.1 AA Requirement
 */

import React from 'react'
import { useTranslations } from 'use-intl'

export function SkipLink() {
  const t = useTranslations('accessibility')

  return (
    <a
      href="#main-content"
      className="skip-link"
      aria-label={t('skipToContent')}
    >
      {t('skipToContent')}
    </a>
  )
}
