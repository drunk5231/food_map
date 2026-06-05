import { useContext } from 'react'
import { DishCacheContext } from '../context/dish-cache-store'

export function useDishCache() {
  return useContext(DishCacheContext)
}
