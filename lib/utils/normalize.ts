/**
 * Data normalization utilities for Supabase query results
 *
 * Supabase nested queries sometimes return arrays, sometimes objects.
 * These utilities provide type-safe normalization.
 */

/**
 * Normalize a single relation that might be returned as an array or object
 * @param data - The data to normalize (can be T, T[], null, or undefined)
 * @returns The first item if array, the item itself if object, or null
 */
export function normalizeSingleRelation<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null
  if (Array.isArray(data)) return data[0] || null
  return data
}

/**
 * Normalize an array relation that might be returned as a single object
 * @param data - The data to normalize (can be T, T[], null, or undefined)
 * @returns Always returns an array
 */
export function normalizeArrayRelation<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  return [data]
}

/**
 * Safely extract a nested property from Supabase query results
 * @param obj - The object to extract from
 * @param path - Dot-separated path to the property
 * @returns The value at the path or null
 */
export function safeExtract<T = any>(obj: any, path: string): T | null {
  if (!obj) return null

  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) return null
    current = current[key]
  }

  return current ?? null
}

/**
 * Type guard to check if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: any): value is T[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * Normalize user data from various query formats
 * Ensures consistent field names: avatar (not avatar_url), full_name (not display_name)
 */
export interface NormalizedUser {
  id: string
  username: string
  full_name: string | null
  avatar: string | null
  bio: string | null
  role: string
  membership_tier: string
  followers_count?: number
  following_count?: number
}

export function normalizeUser(user: any): NormalizedUser | null {
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name || user.display_name || null,
    avatar: user.avatar || user.avatar_url || null,
    bio: user.bio || null,
    role: user.role || 'user',
    membership_tier: user.membership_tier || 'free',
    followers_count: user.followers_count || 0,
    following_count: user.following_count || 0,
  }
}

/**
 * Normalize an array of users
 */
export function normalizeUsers(users: any[]): NormalizedUser[] {
  if (!Array.isArray(users)) return []
  return users.map(normalizeUser).filter((u): u is NormalizedUser => u !== null)
}
