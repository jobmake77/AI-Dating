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
type LooseRecord = Record<string, unknown>

function isLooseRecord(value: unknown): value is LooseRecord {
  return typeof value === 'object' && value !== null
}

export function safeExtract<T = unknown>(obj: unknown, path: string): T | null {
  if (!isLooseRecord(obj)) return null

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (!isLooseRecord(current) || !(key in current)) return null
    current = current[key]
  }

  return (current as T | null | undefined) ?? null
}

/**
 * Type guard to check if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
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
  followers_count?: number
  following_count?: number
}

type RawUserRecord = LooseRecord & {
  id?: unknown
  username?: unknown
  full_name?: unknown
  display_name?: unknown
  avatar?: unknown
  avatar_url?: unknown
  bio?: unknown
  role?: unknown
  followers_count?: unknown
  following_count?: unknown
}

export function normalizeUser(user: unknown): NormalizedUser | null {
  if (!isLooseRecord(user)) return null

  const rawUser = user as RawUserRecord
  if (typeof rawUser.id !== 'string' || typeof rawUser.username !== 'string') {
    return null
  }

  return {
    id: rawUser.id,
    username: rawUser.username,
    full_name: typeof rawUser.full_name === 'string'
      ? rawUser.full_name
      : typeof rawUser.display_name === 'string'
        ? rawUser.display_name
        : null,
    avatar: typeof rawUser.avatar === 'string'
      ? rawUser.avatar
      : typeof rawUser.avatar_url === 'string'
        ? rawUser.avatar_url
        : null,
    bio: typeof rawUser.bio === 'string' ? rawUser.bio : null,
    role: typeof rawUser.role === 'string' ? rawUser.role : 'user',
    followers_count: typeof rawUser.followers_count === 'number' ? Math.max(rawUser.followers_count, 0) : 0,
    following_count: typeof rawUser.following_count === 'number' ? Math.max(rawUser.following_count, 0) : 0,
  }
}

/**
 * Normalize an array of users
 */
export function normalizeUsers(users: unknown[]): NormalizedUser[] {
  if (!Array.isArray(users)) return []
  return users.map(normalizeUser).filter((u): u is NormalizedUser => u !== null)
}
