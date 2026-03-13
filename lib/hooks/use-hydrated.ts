'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function useClientOrigin() {
  return useSyncExternalStore(emptySubscribe, () => window.location.origin, () => '')
}
