import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const ignoredPaths = [
  '.next/**',
  '.worktrees/**',
  'coverage/**',
  'playwright-report/**',
  'test-results/**',
  'e2e/screenshots/**',
  'impeccable/**',
]

const eslintConfig = [
  {
    ignores: ignoredPaths,
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
]

export default eslintConfig
