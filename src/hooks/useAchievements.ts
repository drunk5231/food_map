import { useEffect, useRef, useMemo } from 'react'
import type { UserState, Dish } from '../types'
import { cuisineFamilies, provinceMeta } from '../data/provinces'

const FAVORITE_MILESTONES = [1, 10, 50]
const EATEN_MILESTONES = [1, 10, 50]
const SPICY_THRESHOLD = 7
const SWEET_THRESHOLD = 5
const PROVINCE_MILESTONES = [5, 15, 30]

interface AchievementCheckerProps {
  state: UserState
  unlockAchievement: (id: string) => void
  allDishes?: Dish[]
}

/**
 * Pre-compute dish-dependent achievement metrics.
 * Only recalculates when favorites or allDishes change,
 * not on every state field change (e.g. eaten, wantToEat).
 */
function useDishMetrics(allDishes: Dish[], favorites: string[]) {
  return useMemo(() => {
    if (!allDishes.length || !favorites.length) return null
    const favSet = new Set(favorites)
    const favDishes = allDishes.filter(d => favSet.has(d.id))
    const spicyFavs = favDishes.filter(d => d.spicy >= SPICY_THRESHOLD)
    const sweetFavs = favDishes.filter(d => d.sweet >= SWEET_THRESHOLD)
    const provinces = new Set(favDishes.map(d => d.province_id).filter(Boolean))
    const allProvinces = new Set(allDishes.map(d => d.province_id).filter(Boolean))
    const provinceToFamily = new Map(provinceMeta.map(p => [p.id, p.cuisine_family]))
    const coveredFamilies = new Set(
      favDishes.map(d => provinceToFamily.get(d.province_id)).filter(Boolean)
    )
    return { spicyFavs, sweetFavs, provinces, allProvinces, coveredFamilies }
  }, [allDishes, favorites])
}

export function useAchievements({ state, unlockAchievement, allDishes = [] }: AchievementCheckerProps) {
  const prevRef = useRef(state)
  const metrics = useDishMetrics(allDishes, state.favorites)

  // Achievements that depend only on state field lengths
  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = state

    if (state.favorites.length >= FAVORITE_MILESTONES[0]) unlockAchievement('first_taste')
    if (state.favorites.length >= FAVORITE_MILESTONES[1]) unlockAchievement('foodie_beginner')
    if (state.favorites.length >= FAVORITE_MILESTONES[2]) unlockAchievement('foodie_master')

    if (!prev.tasteProfile && state.tasteProfile) {
      unlockAchievement('taste_test_done')
    }

    if (state.wantToEat.length >= 10) unlockAchievement('wishlist_10')
    if (state.eaten.length >= EATEN_MILESTONES[1]) unlockAchievement('eaten_10')
    if (state.eaten.length >= EATEN_MILESTONES[2]) unlockAchievement('eaten_50')

    // night_owl / early_bird
    if (state.eaten.length > 0) {
      const hour = new Date().getHours()
      if (hour >= 22 || hour < 6) unlockAchievement('night_owl')
      if (hour >= 6 && hour < 8) unlockAchievement('early_bird')
    }
  }, [state, unlockAchievement])

  // Achievements that depend on dish data (only re-evaluate when metrics change)
  useEffect(() => {
    if (!metrics) return

    if (metrics.spicyFavs.length >= 10) unlockAchievement('spicy_king')
    if (metrics.sweetFavs.length >= 10) unlockAchievement('sweet_tooth')

    if (metrics.provinces.size >= PROVINCE_MILESTONES[0]) unlockAchievement('province_explorer_5')
    if (metrics.provinces.size >= PROVINCE_MILESTONES[1]) unlockAchievement('province_explorer_10')

    if (metrics.provinces.size >= metrics.allProvinces.size && metrics.allProvinces.size > 0) {
      unlockAchievement('province_explorer_all')
    }

    if (metrics.coveredFamilies.size >= cuisineFamilies.length) {
      unlockAchievement('eight_cuisines')
    }
  }, [metrics, unlockAchievement])
}
