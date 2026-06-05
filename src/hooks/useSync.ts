import { useEffect, useRef, useCallback } from 'react'
import type { UserState, FlavorProfile, AuthUser } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { loadSyncTimestamp } from '../utils/storage'

const SYNC_DEBOUNCE_MS = 2000
const LAST_SYNCED_USER_KEY = 'food-map-last-synced-user'

/** Supabase row shape (snake_case columns) */
interface UserStateRow {
  favorites: string[]
  eaten: string[]
  want_to_eat: string[]
  visited_counties: string[]
  taste_profile: FlavorProfile | null
  achievements: string[]
  updated_at: string
}

interface UpsertPayload extends Omit<UserStateRow, 'updated_at'> {
  user_id: string
  updated_at: string
}

function isValidRow(data: unknown): data is UserStateRow {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    Array.isArray(obj.favorites) &&
    Array.isArray(obj.eaten) &&
    Array.isArray(obj.want_to_eat) &&
    Array.isArray(obj.visited_counties) &&
    Array.isArray(obj.achievements) &&
    (obj.taste_profile === null || typeof obj.taste_profile === 'object')
  )
}

function toRow(state: UserState): Omit<UserStateRow, 'updated_at'> {
  return {
    favorites: state.favorites,
    eaten: state.eaten,
    want_to_eat: state.wantToEat,
    visited_counties: state.visitedCounties,
    taste_profile: state.tasteProfile,
    achievements: state.achievements,
  }
}

function fromRow(row: UserStateRow): UserState {
  return {
    favorites: row.favorites ?? [],
    eaten: row.eaten ?? [],
    wantToEat: row.want_to_eat ?? [],
    visitedCounties: row.visited_counties ?? [],
    tasteProfile: row.taste_profile,
    achievements: row.achievements ?? [],
  }
}

function unionArrays(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])]
}

function mergeStates(
  local: UserState,
  remote: UserState,
  remoteUpdatedAt: string,
  localModifiedAt: number,
): UserState {
  const remoteTime = new Date(remoteUpdatedAt).getTime()
  const remoteIsNewer = remoteTime > localModifiedAt

  return {
    favorites: unionArrays(local.favorites, remote.favorites),
    eaten: unionArrays(local.eaten, remote.eaten),
    wantToEat: unionArrays(local.wantToEat, remote.wantToEat),
    visitedCounties: unionArrays(local.visitedCounties, remote.visitedCounties),
    achievements: unionArrays(local.achievements, remote.achievements),
    tasteProfile: (() => {
      if (!local.tasteProfile) return remote.tasteProfile
      if (!remote.tasteProfile) return local.tasteProfile
      return remoteIsNewer ? remote.tasteProfile : local.tasteProfile
    })(),
  }
}

interface UseSyncOptions {
  state: UserState
  replaceState: (state: UserState) => void
  user: AuthUser | null
}

/**
 * Syncs user state with Supabase when authenticated.
 * - On login: fetches remote state, merges with local, pushes merged result
 * - On state change (debounced): pushes to Supabase
 * - On logout: stops syncing (local data preserved)
 * - No-op when Supabase is not configured or user is not logged in
 */
export function useSync({ state, replaceState, user }: UseSyncOptions) {
  const isSyncingRef = useRef(false)
  const syncGenRef = useRef(0)
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const prevUserIdRef = useRef<string | null>(null)

  // --- On login: fetch remote, merge, push ---
  useEffect(() => {
    const currentUserId = user?.id ?? null
    const prevUserId = prevUserIdRef.current
    prevUserIdRef.current = currentUserId

    if (!currentUserId || !supabase || !isSupabaseConfigured) return
    if (currentUserId === prevUserId) return

    // Bug 2: generation counter to cancel stale sync operations
    const gen = ++syncGenRef.current

    const syncOnLogin = async () => {
      if (!supabase) return
      isSyncingRef.current = true

      try {
        // Bug 3: detect cross-user contamination
        const lastSyncedUser = localStorage.getItem(LAST_SYNCED_USER_KEY)
        const isDifferentUser = lastSyncedUser !== null && lastSyncedUser !== currentUserId

        const { data, error } = await supabase
          .from('user_states')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle()

        // Bug 2: bail if a newer sync has started
        if (syncGenRef.current !== gen) return

        if (error) {
          console.error('[sync] Fetch remote state failed:', error)
          const payload: UpsertPayload = {
            ...toRow(stateRef.current),
            user_id: currentUserId,
            updated_at: new Date().toISOString(),
          }
          const { error: upsertError } = await supabase.from('user_states').upsert(payload, { onConflict: 'user_id' })
          if (upsertError) console.error('[sync] Upsert failed:', upsertError)
          return
        }

        if (data) {
          // Bug 5: validate before casting
          if (!isValidRow(data)) {
            console.error('[sync] Invalid row data from Supabase:', data)
            return
          }
          const row = data as UserStateRow

          if (isDifferentUser) {
            // Bug 3: different user — use remote state, don't merge stale local data
            const remoteState = fromRow(row)
            replaceState(remoteState)
            // Update lastSyncedUser so subsequent changes push to this user
            localStorage.setItem(LAST_SYNCED_USER_KEY, currentUserId)
          } else {
            // Same user — merge as before
            const remoteState = fromRow(row)
            const localModifiedAt = loadSyncTimestamp()
            const merged = mergeStates(stateRef.current, remoteState, row.updated_at, localModifiedAt)
            replaceState(merged)

            if (syncGenRef.current !== gen) return
            const payload: UpsertPayload = {
              ...toRow(merged),
              user_id: currentUserId,
              updated_at: new Date().toISOString(),
            }
            const { error: upsertError } = await supabase.from('user_states').upsert(payload, { onConflict: 'user_id' })
            if (upsertError) console.error('[sync] Upsert failed:', upsertError)
          }
        } else {
          // No remote row yet
          if (isDifferentUser) {
            // Different user with no remote data — reset to clean defaults
            const emptyState: UserState = {
              favorites: [], eaten: [], wantToEat: [],
              visitedCounties: [], tasteProfile: null, achievements: [],
            }
            replaceState(emptyState)
            localStorage.setItem(LAST_SYNCED_USER_KEY, currentUserId)
            // Push empty state as this user's initial remote data
            if (syncGenRef.current !== gen) return
            const payload: UpsertPayload = {
              ...toRow(emptyState),
              user_id: currentUserId,
              updated_at: new Date().toISOString(),
            }
            const { error: upsertError } = await supabase.from('user_states').upsert(payload, { onConflict: 'user_id' })
            if (upsertError) console.error('[sync] Upsert failed:', upsertError)
          } else {
            // Same user — push local state as initial remote data
            const payload: UpsertPayload = {
              ...toRow(stateRef.current),
              user_id: currentUserId,
              updated_at: new Date().toISOString(),
            }
            if (syncGenRef.current !== gen) return
            const { error: upsertError } = await supabase.from('user_states').upsert(payload, { onConflict: 'user_id' })
            if (upsertError) console.error('[sync] Upsert failed:', upsertError)
          }
        }
      } catch (err) {
        console.error('[sync] Login sync error:', err)
      } finally {
        // Bug 2: only clear syncing flag if this is still the current generation
        if (syncGenRef.current === gen) isSyncingRef.current = false
        localStorage.setItem(LAST_SYNCED_USER_KEY, currentUserId)
      }
    }

    syncOnLogin()
  }, [user?.id, replaceState])

  // --- Debounced push on state change ---
  const pushToRemote = useCallback(
    async (currentState: UserState, userId: string) => {
      if (!supabase) return
      try {
        const payload: UpsertPayload = {
          ...toRow(currentState),
          user_id: userId,
          updated_at: new Date().toISOString(),
        }
        const { error } = await supabase
          .from('user_states')
          .upsert(payload, { onConflict: 'user_id' })
        if (error) console.error('[sync] Push failed:', error)
      } catch (err) {
        console.error('[sync] Push error:', err)
      }
    },
    [],
  )

  useEffect(() => {
    if (!user || !supabase || !isSupabaseConfigured || isSyncingRef.current) return

    const timer = setTimeout(() => {
      pushToRemote(state, user.id)
    }, SYNC_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [state, user, pushToRemote])
}
