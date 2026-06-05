// ==================== 省份 ====================
export interface Province {
  id: string
  name: string
  region: string
  cuisine_family: string
  description: string
  color: string
}

// ==================== 美食 ====================
export type DishCategory =
  | 'snack'
  | 'main'
  | 'soup'
  | 'dessert'
  | 'staple'
  | 'cold_dish'
  | 'street_food'
  | 'drink'

export type CookingMethod =
  | 'stir_fry'
  | 'steam'
  | 'boil'
  | 'deep_fry'
  | 'roast'
  | 'cold'
  | 'braise'
  | 'smoke'
  | 'pickle'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all'

export interface Dish {
  id: string
  name: string
  province_id: string
  county_id: string | null
  category: DishCategory
  tags: string[]

  // 口味 0-10
  spicy: number
  sweet: number
  sour: number
  salty: number
  umami: number
  numbing: number
  bitter: number
  aromatic: number

  cooking_methods: CookingMethod[]
  main_ingredients: string[]
  difficulty: number

  recipe: string | null
  story: string | null
  history: string | null
  best_season: Season
  related_solar_terms: string[]

  emoji: string
  description: string | null

  pairing_drink: string | null
  pairing_side: string | null
  pairing_staple: string | null

  created_at: string
}

// ==================== 节气 ====================
export type SeasonName = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SolarTerm {
  id: string
  name: string
  english_name: string | null
  month: number
  day: number
  season: SeasonName
  description: string | null
  food_advice: string | null
  recommended_dishes: string[]
}

// ==================== 用户状态 ====================
export interface UserState {
  favorites: string[]
  eaten: string[]
  wantToEat: string[]
  visitedCounties: string[]
  tasteProfile: FlavorProfile | null
  achievements: string[]
}

// ==================== 口味 ====================
export interface FlavorProfile {
  spicy: number
  sweet: number
  sour: number
  salty: number
  umami: number
  numbing: number
  bitter: number
  aromatic: number
}

// ==================== 口味测试 ====================
export interface TasteQuestion {
  id: number
  question: string
  options: {
    text: string
    scores: Partial<FlavorProfile>
  }[]
}

// ==================== 口味测试历史 ====================
export interface TasteTestRecord {
  timestamp: number
  profile: FlavorProfile
  topDishIds: string[]
}

// ==================== 认证 ====================
export interface AuthUser {
  id: string
  email: string | undefined
}

// ==================== 成就 ====================
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}
