import type { Dish } from '../types'
import { FLAVOR_KEYS } from './flavorProfile'

export function isDish(value: unknown): value is Dish {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== 'string' || !obj.id) return false
  if (typeof obj.name !== 'string' || !obj.name) return false
  if (typeof obj.province_id !== 'string') return false
  const validCategories = ['snack', 'main', 'soup', 'dessert', 'staple', 'cold_dish', 'street_food', 'drink']
  if (!validCategories.includes(obj.category as string)) return false
  for (const key of FLAVOR_KEYS) {
    const val = obj[key]
    if (typeof val !== 'number' || val < 0 || val > 10) return false
  }
  return true
}

export function isValidCacheEnvelope(data: unknown): data is { dishes: Dish[]; timestamp: number; version: number } {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.dishes)) return false
  if (typeof obj.timestamp !== 'number') return false
  if (typeof obj.version !== 'number') return false
  return true
}
