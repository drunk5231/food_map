import { createContext } from 'react'
import type { Dish } from '../types'

interface DishCacheContextType {
  dishes: Dish[]
  loading: boolean
  error: string | null
  retry: () => void
}

export const DishCacheContext = createContext<DishCacheContextType>({
  dishes: [],
  loading: true,
  error: null,
  retry: () => {},
})
