'use client'

/**
 * Skip Link Component
 * Allows keyboard users to skip to main content
 * WCAG 2.1 AA Requirement
 */

import React from 'react'

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      aria-label="跳转到主要内容"
    >
      跳转到主要内容
    </a>
  )
}
