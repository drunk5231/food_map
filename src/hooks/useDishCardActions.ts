import { useCallback } from 'react'
import { useApp } from '../context/AppContext'

export function useDishCardActions(dishId: string) {
  const { favoriteSet, eatenSet, toggleFavorite, toggleEaten } = useApp()
  return {
    isFavorite: favoriteSet.has(dishId),
    isEaten: eatenSet.has(dishId),
    onToggleFavorite: useCallback(() => toggleFavorite(dishId), [dishId, toggleFavorite]),
    onToggleEaten: useCallback(() => toggleEaten(dishId), [dishId, toggleEaten]),
  }
}
