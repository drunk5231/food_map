import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
import { useUserState } from '../hooks/useUserState'
import { useAchievements } from '../hooks/useAchievements'
import { useDishCache } from '../hooks/useDishCache'
import { useAuth } from '../hooks/useAuth'
import { useSync } from '../hooks/useSync'
import { useToast } from '../components/ui/Toast'
import { achievements } from '../data/achievements'
import type { UserState, FlavorProfile, AuthUser } from '../types'

interface AppContextType {
  state: UserState
  toggleFavorite: (dishId: string) => void
  toggleEaten: (dishId: string) => void
  toggleWantToEat: (dishId: string) => void
  setTasteProfile: (profile: FlavorProfile) => void
  unlockAchievement: (id: string) => void
  markProvinceVisited: (provinceId: string) => void
  resetState: () => void
  /** Memoized Sets for O(1) membership checks */
  favoriteSet: Set<string>
  eatenSet: Set<string>
  wantToEatSet: Set<string>
  /** Auth */
  user: AuthUser | null
  authLoading: boolean
  signInWithEmail: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const userState = useUserState()
  const auth = useAuth()
  const { addToast } = useToast()
  const { dishes } = useDishCache()

  useSync({
    state: userState.state,
    replaceState: userState.replaceState,
    user: auth.user,
  })

  useAchievements({
    state: userState.state,
    unlockAchievement: userState.unlockAchievement,
    allDishes: dishes,
  })

  const currentAchievements = userState.state.achievements
  const rawUnlockAchievement = userState.unlockAchievement
  const unlockAchievement = useCallback(
    (id: string) => {
      if (currentAchievements.includes(id)) return
      rawUnlockAchievement(id)
      const ach = achievements.find((a) => a.id === id)
      if (ach) {
        addToast('achievement', `解锁成就「${ach.name}」— ${ach.description}`)
      }
    },
    [currentAchievements, rawUnlockAchievement, addToast],
  )

  // Memoized Sets for O(1) membership checks
  const favoriteSet = useMemo(() => new Set(userState.state.favorites), [userState.state.favorites])
  const eatenSet = useMemo(() => new Set(userState.state.eaten), [userState.state.eaten])
  const wantToEatSet = useMemo(() => new Set(userState.state.wantToEat), [userState.state.wantToEat])

  const value = useMemo<AppContextType>(
    () => ({
      state: userState.state,
      toggleFavorite: userState.toggleFavorite,
      toggleEaten: userState.toggleEaten,
      toggleWantToEat: userState.toggleWantToEat,
      setTasteProfile: userState.setTasteProfile,
      unlockAchievement,
      markProvinceVisited: userState.markProvinceVisited,
      resetState: userState.resetState,
      favoriteSet,
      eatenSet,
      wantToEatSet,
      user: auth.user,
      authLoading: auth.loading,
      signInWithEmail: auth.signInWithEmail,
      verifyOtp: auth.verifyOtp,
      signOut: auth.signOut,
    }),
    [userState.state, userState.toggleFavorite, userState.toggleEaten, userState.toggleWantToEat, userState.setTasteProfile, userState.markProvinceVisited, userState.resetState, unlockAchievement, favoriteSet, eatenSet, wantToEatSet, auth.user, auth.loading, auth.signInWithEmail, auth.verifyOtp, auth.signOut],
  )

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
