import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { UserState, FlavorProfile } from '../types'
import { loadUserState, saveUserState, saveSyncTimestamp } from '../utils/storage'
import { DEBOUNCE_MS } from '../constants'

export function useUserState() {
  const [state, setState] = useState<UserState>(loadUserState)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Debounced save to avoid blocking main thread on rapid toggles
  useEffect(() => {
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveUserState(state)
      saveSyncTimestamp(Date.now())
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(saveTimerRef.current)
      saveUserState(state) // flush immediately on unmount to prevent data loss
      saveSyncTimestamp(Date.now())
    }
  }, [state])

  const makeToggle = useCallback(
    (key: 'favorites' | 'eaten' | 'wantToEat') =>
      (dishId: string) => {
        setState((prev) => {
          const has = prev[key].includes(dishId)
          return {
            ...prev,
            [key]: has
              ? prev[key].filter((id) => id !== dishId)
              : [...prev[key], dishId],
          }
        })
      },
    []
  )

  const toggleFavorite = useMemo(() => makeToggle('favorites'), [makeToggle])
  const toggleEaten = useMemo(() => makeToggle('eaten'), [makeToggle])
  const toggleWantToEat = useMemo(() => makeToggle('wantToEat'), [makeToggle])

  const setTasteProfile = useCallback((profile: FlavorProfile) => {
    setState((prev) => ({ ...prev, tasteProfile: profile }))
  }, [])

  const unlockAchievement = useCallback((achievementId: string) => {
    setState((prev) => {
      if (prev.achievements.includes(achievementId)) return prev
      return { ...prev, achievements: [...prev.achievements, achievementId] }
    })
  }, [])

  const markProvinceVisited = useCallback((provinceId: string) => {
    setState((prev) => {
      if (prev.visitedCounties.includes(provinceId)) return prev
      return { ...prev, visitedCounties: [...prev.visitedCounties, provinceId] }
    })
  }, [])

  const resetState = useCallback(() => {
    setState({ favorites: [], eaten: [], wantToEat: [], visitedCounties: [], tasteProfile: null, achievements: [] })
  }, [])

  /** Replace entire user state (used by sync on login merge) */
  const replaceState = useCallback((newState: UserState) => {
    setState(newState)
  }, [])

  return {
    state,
    toggleFavorite,
    toggleEaten,
    toggleWantToEat,
    setTasteProfile,
    unlockAchievement,
    markProvinceVisited,
    resetState,
    replaceState,
  }
}
