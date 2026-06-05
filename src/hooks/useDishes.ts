import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { localDishes } from '../data/localDishes'
import type { Dish, DishCategory, CookingMethod } from '../types'
import { isDish } from '../utils/validators'

export interface DishFilters {
  provinceId?: string
  category?: DishCategory
  cookingMethod?: CookingMethod
  search?: string
  minSpicy?: number
  maxDifficulty?: number
  bestSeason?: string
  enabled?: boolean
}

function sanitizeSearch(input: string): string {
  return input.replace(/[%(){},\\'"<>]/g, '').trim()
}

export function useDishes(filters: DishFilters = {}) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const enabled = filters.enabled !== false

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function fetchDishes() {
      setLoading(true)
      setError(null)

      try {
      // Gracefully fall back to local data when Supabase is not configured
      if (!supabase) {
        if (!cancelled) {
          const fallback = filters.provinceId
            ? localDishes.filter((d) => d.province_id === filters.provinceId)
            : localDishes
          setDishes(fallback)
          setLoading(false)
        }
        return
      }

      let query = supabase.from('dishes').select('id, name, province_id, county_id, category, tags, spicy, sweet, sour, salty, umami, numbing, bitter, aromatic, cooking_methods, main_ingredients, difficulty, recipe, story, history, best_season, related_solar_terms, emoji, description, pairing_drink, pairing_side, pairing_staple, created_at')

      if (filters.provinceId) {
        query = query.eq('province_id', filters.provinceId)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.search) {
        const safeSearch = sanitizeSearch(filters.search)
        if (safeSearch) {
          query = query.or(
            `name.ilike.%${safeSearch}%,main_ingredients.cs.{${safeSearch}},description.ilike.%${safeSearch}%`
          )
        }
      }
      if (filters.minSpicy !== undefined) {
        query = query.gte('spicy', filters.minSpicy)
      }
      if (filters.maxDifficulty !== undefined) {
        query = query.lte('difficulty', filters.maxDifficulty)
      }

      const { data, error: err } = await query.limit(2000)

      if (cancelled) return

      if (err) {
        // Supabase query error — fall back to local data
        const fallback = filters.provinceId
          ? localDishes.filter((d) => d.province_id === filters.provinceId)
          : localDishes
        setDishes(fallback)
        setError(null)
      } else {
        setDishes((data || []).filter(isDish))
      }
      setLoading(false)
      } catch {
        if (!cancelled) {
          // Network or other error — fall back to local data
          const fallback = filters.provinceId
            ? localDishes.filter((d) => d.province_id === filters.provinceId)
            : localDishes
          setDishes(fallback)
          setError(null)
          setLoading(false)
        }
      }
    }

    fetchDishes()

    return () => {
      cancelled = true
    }
  }, [
    filters.provinceId,
    filters.category,
    filters.search,
    filters.minSpicy,
    filters.maxDifficulty,
    // cookingMethod and bestSeason are intentionally excluded:
    // they are applied client-side via useMemo below, not in the Supabase query.
    enabled,
  ])

  // 客户端侧的额外过滤（烹饪方式、季节等需要从数组字段匹配）
  const filtered = useMemo(() => {
    let result = dishes

    if (filters.cookingMethod) {
      result = result.filter((d) =>
        d.cooking_methods.includes(filters.cookingMethod!)
      )
    }
    if (filters.bestSeason && filters.bestSeason !== 'all') {
      result = result.filter(
        (d) => d.best_season === 'all' || d.best_season === filters.bestSeason
      )
    }

    return result
  }, [dishes, filters.cookingMethod, filters.bestSeason])

  return { dishes: filtered, loading: enabled && loading, error, total: dishes.length }
}
