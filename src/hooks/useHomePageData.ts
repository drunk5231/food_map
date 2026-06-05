import { useState, useCallback, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { localDishes } from '../data/localDishes'
import { hotDishIds } from '../data/hotDishes'
import type { Dish } from '../types'

interface StatItem {
  label: string
  icon: string
  count: number
  gradient: string
  darkGradient: string
}

export function useHomePageData() {
  const { state } = useApp()

  // ---- Hot dishes ----
  const hotDishes = useMemo(
    () => hotDishIds.map((id) => localDishes.find((d) => d.id === id)).filter(Boolean) as Dish[],
    []
  )

  // ---- Selected dish state ----
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const handleDishClick = useCallback((dish: Dish) => {
    setSelectedDish(dish)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedDish(null)
  }, [])

  // ---- User stats ----
  const visitedProvinceCount = useMemo(() => {
    const uniqueProvinces = new Set(state.visitedCounties)
    return uniqueProvinces.size
  }, [state.visitedCounties])

  const stats = useMemo<StatItem[]>(
    () => [
      {
        label: '收藏',
        icon: '❤️',
        count: state.favorites.length,
        gradient: 'from-red-500 to-pink-500',
        darkGradient: 'dark:from-red-600 dark:to-pink-600',
      },
      {
        label: '已吃',
        icon: '✅',
        count: state.eaten.length,
        gradient: 'from-green-500 to-emerald-500',
        darkGradient: 'dark:from-green-600 dark:to-emerald-600',
      },
      {
        label: '想吃',
        icon: '🤤',
        count: state.wantToEat.length,
        gradient: 'from-orange-500 to-amber-500',
        darkGradient: 'dark:from-orange-600 dark:to-amber-600',
      },
      {
        label: '已访省份',
        icon: '🗺️',
        count: visitedProvinceCount,
        gradient: 'from-blue-500 to-cyan-500',
        darkGradient: 'dark:from-blue-600 dark:to-cyan-600',
      },
    ],
    [state.favorites.length, state.eaten.length, state.wantToEat.length, visitedProvinceCount]
  )

  return { hotDishes, selectedDish, handleDishClick, handleCloseModal, stats, visitedProvinceCount }
}
