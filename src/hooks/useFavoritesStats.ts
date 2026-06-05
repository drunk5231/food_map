import { useMemo } from 'react'
import type { Dish, FlavorProfile } from '../types'
import { FLAVOR_KEYS } from '../utils/flavorProfile'

export interface FavoritesStats {
  topProvinces: [string, number][]
  avgFlavors: Record<keyof FlavorProfile, number>
  catCount: Record<string, number>
  total: number
  collectedProvinces: string[]
}

/**
 * Computes statistics from a user's favorite dishes:
 * - taste DNA description / radar chart data (avgFlavors)
 * - province coverage and top provinces
 * - category distribution
 */
export function useFavoritesStats(
  favoriteDishes: Dish[]
): FavoritesStats | null {
  return useMemo(() => {
    if (favoriteDishes.length === 0) return null

    // Province distribution
    const provinceCount: Record<string, number> = {}
    for (const d of favoriteDishes) {
      provinceCount[d.province_id] = (provinceCount[d.province_id] || 0) + 1
    }
    const topProvinces = Object.entries(provinceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Average flavor profile
    const avgFlavors = Object.fromEntries(
      FLAVOR_KEYS.map((k) => [k, 0])
    ) as Record<keyof FlavorProfile, number>
    for (const d of favoriteDishes) {
      for (const k of FLAVOR_KEYS) {
        avgFlavors[k] += d[k]
      }
    }
    for (const k of FLAVOR_KEYS) {
      avgFlavors[k] =
        Math.round((avgFlavors[k] / favoriteDishes.length) * 10) / 10
    }

    // Category distribution
    const catCount: Record<string, number> = {}
    for (const d of favoriteDishes) {
      catCount[d.category] = (catCount[d.category] || 0) + 1
    }

    // Collected provinces
    const collectedProvinces = Object.keys(provinceCount)

    return {
      topProvinces,
      avgFlavors,
      catCount,
      total: favoriteDishes.length,
      collectedProvinces,
    }
  }, [favoriteDishes])
}
