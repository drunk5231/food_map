export const DEBOUNCE_MS = 300
export const TOAST_DURATION_MS = 3000
export const SCROLL_SHOW_THRESHOLD_PX = 300
export const MAX_SEARCH_HISTORY = 20
export const MAX_TASTE_HISTORY = 10
export const DISH_CACHE_TTL_MS = 30 * 60 * 1000
export const DISHES_PER_PAGE = 30
export const MAP_MIN_SCALE = 0.5
export const MAP_MAX_SCALE = 5
export const DRAG_THRESHOLD_PX = 3

export const STORAGE_KEYS = {
  USER_STATE: 'food-map-user-state',
  SEARCH_HISTORY: 'food-map-search-history',
  TASTE_HISTORY: 'food-map-taste-history',
  DISH_CACHE: 'food-map-dish-cache',
  THEME: 'food-map-theme',
} as const
