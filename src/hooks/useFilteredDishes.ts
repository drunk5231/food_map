import { useMemo } from 'react'
import type { DishCategory, CookingMethod, Dish } from '../types'

export type SortOption = 'default' | 'spicy_desc' | 'sweet_desc' | 'difficulty_asc'

export interface FilterState {
  search: string
  province: string
  category: DishCategory | ''
  method: CookingMethod | ''
  minSpicy: number
  maxDifficulty: number
  sortBy: SortOption
}

function sortDishes(dishes: Dish[], sort: SortOption): Dish[] {
  if (sort === 'default') return dishes
  const sorted = [...dishes]
  switch (sort) {
    case 'spicy_desc':
      return sorted.sort((a, b) => b.spicy - a.spicy)
    case 'sweet_desc':
      return sorted.sort((a, b) => b.sweet - a.sweet)
    case 'difficulty_asc':
      return sorted.sort((a, b) => a.difficulty - b.difficulty)
    default:
      return sorted
  }
}

/**
 * Filters and sorts dishes based on search query, category, province,
 * cooking method, min spicy level, max difficulty, and sort option.
 */
export function useFilteredDishes(
  allDishes: Dish[],
  filters: FilterState
): Dish[] {
  const {
    search,
    province,
    category,
    method,
    minSpicy,
    maxDifficulty,
    sortBy,
  } = filters

  return useMemo(() => {
    let result = allDishes

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.main_ingredients.some((i) => i.toLowerCase().includes(q)) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (province) {
      result = result.filter((d) => d.province_id === province)
    }

    if (category) {
      result = result.filter((d) => d.category === category)
    }

    if (method) {
      result = result.filter((d) => d.cooking_methods.includes(method))
    }

    if (minSpicy > 0) {
      result = result.filter((d) => d.spicy >= minSpicy)
    }

    if (maxDifficulty < 5) {
      result = result.filter((d) => d.difficulty <= maxDifficulty)
    }

    return sortDishes(result, sortBy)
  }, [allDishes, search, province, category, method, minSpicy, maxDifficulty, sortBy])
}
