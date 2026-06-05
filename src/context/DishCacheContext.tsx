import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { DishCacheContext } from './dish-cache-store'
import { localDishes } from '../data/localDishes'
import type { Dish } from '../types'
import { isDish, isValidCacheEnvelope } from '../utils/validators'
import { STORAGE_KEYS, DISH_CACHE_TTL_MS } from '../constants'
import { idbGetDishes, idbSetDishes } from '../utils/idb'

export { DishCacheContext } from './dish-cache-store'

const CACHE_KEY = STORAGE_KEYS.DISH_CACHE
const CACHE_TTL = DISH_CACHE_TTL_MS
const CACHE_VERSION = 1

interface CacheResult {
  dishes: Dish[] | null
  stale: boolean
}

function getLocalCachedDishes(): CacheResult {
  if (typeof window === 'undefined') return { dishes: null, stale: false }
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return { dishes: null, stale: false }
    const parsed: unknown = JSON.parse(raw)
    if (!isValidCacheEnvelope(parsed)) {
      localStorage.removeItem(CACHE_KEY)
      return { dishes: null, stale: false }
    }
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY)
      return { dishes: null, stale: false }
    }
    const filtered = parsed.dishes.filter(isDish)
    const isFresh = Date.now() - parsed.timestamp < CACHE_TTL
    return { dishes: filtered, stale: !isFresh }
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return { dishes: null, stale: false }
  }
}

/** Try IndexedDB first, fall back to localStorage */
async function getCachedDishes(): Promise<CacheResult> {
  // Try IndexedDB first (larger storage, no 5MB limit)
  try {
    const idbResult = await idbGetDishes()
    if (idbResult && idbResult.dishes && idbResult.dishes.length > 0) {
      const filtered = idbResult.dishes.filter(isDish)
      const isFresh = Date.now() - idbResult.timestamp < CACHE_TTL
      return { dishes: filtered, stale: !isFresh }
    }
  } catch {
    // IndexedDB unavailable, fall through to localStorage
  }
  // Fall back to localStorage
  return getLocalCachedDishes()
}

/** Write to both IndexedDB and localStorage for maximum reliability */
function setCachedDishes(data: Dish[]) {
  if (typeof window === 'undefined') return
  const timestamp = Date.now()
  const envelope = { dishes: data, timestamp, version: CACHE_VERSION }

  // Write to IndexedDB (primary, larger capacity)
  void idbSetDishes(data, timestamp)

  // Also write to localStorage (fallback)
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(envelope))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[DishCache] localStorage quota exceeded while saving dish cache')
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded', { detail: { key: 'dishCache' } }))
    }
  }
}

function clearCachedDishes() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_KEY)
  // Also clear IndexedDB cache
  void idbSetDishes([], 0)
}

/** Fetch dishes from Supabase and update cache + state */
async function fetchFromSupabase(): Promise<Dish[]> {
  if (!supabase) return localDishes
  const { data, error: fetchError } = await supabase
    .from('dishes')
    .select('id, name, province_id, county_id, category, tags, spicy, sweet, sour, salty, umami, numbing, bitter, aromatic, cooking_methods, main_ingredients, difficulty, recipe, story, history, best_season, related_solar_terms, emoji, description, pairing_drink, pairing_side, pairing_staple, created_at')
    .limit(2000)
  if (fetchError) {
    if (import.meta.env.DEV) console.warn('Supabase fetch failed, using local data:', fetchError.message)
    return localDishes
  }
  return Array.isArray(data) && data.length > 0 ? data.filter(isDish) : localDishes
}

export function DishCacheProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const revalidating = useRef(false)

  const fetchDishes = useCallback(async () => {
    setError(null)

    const { dishes: cachedDishes, stale } = await getCachedDishes()
    if (cachedDishes && cachedDishes.length > 0) {
      // Serve cached data immediately, even if stale
      setDishes(cachedDishes)
      setLoading(false)

      if (stale) {
        // Background re-fetch to update stale cache
        if (revalidating.current) return
        revalidating.current = true
        try {
          const fresh = await fetchFromSupabase()
          setDishes(fresh)
          setCachedDishes(fresh)
        } catch {
          // Keep stale data on re-fetch failure
        } finally {
          revalidating.current = false
        }
      }
      return
    }

    // No cache at all — fetch fresh and show loading
    setLoading(true)
    try {
      const fresh = await fetchFromSupabase()
      setDishes(fresh)
      setCachedDishes(fresh)
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Network error, using local data')
      setError(e instanceof Error ? e.message : 'Failed to fetch dishes')
      setDishes(localDishes)
      setCachedDishes(localDishes)
    } finally {
      setLoading(false)
    }
  }, [])

  const retry = useCallback(async () => {
    clearCachedDishes()
    setLoading(true)
    setError(null)
    try {
      const fresh = await fetchFromSupabase()
      setDishes(fresh)
      setCachedDishes(fresh)
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Network error, using local data')
      setError(e instanceof Error ? e.message : 'Failed to fetch dishes')
      setDishes(localDishes)
      setCachedDishes(localDishes)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Data fetching on mount is intentional for this cache provider
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDishes()
  }, [fetchDishes])

  // Re-fetch when the user returns to the tab if cache is stale
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Use localStorage for quick staleness check (synchronous);
        // full IndexedDB check happens inside fetchDishes if needed
        const { stale } = getLocalCachedDishes()
        if (stale) {
          void fetchDishes()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchDishes])

  const value = useMemo(() => ({ dishes, loading, error, retry }), [dishes, loading, error, retry])

  return (
    <DishCacheContext.Provider value={value}>
      {children}
    </DishCacheContext.Provider>
  )
}
