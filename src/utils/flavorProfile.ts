import type { Dish, FlavorProfile } from '../types'

export const FLAVOR_KEYS: (keyof FlavorProfile)[] = [
  'spicy', 'sweet', 'sour', 'salty',
  'umami', 'numbing', 'bitter', 'aromatic',
]

export function dishToFlavorProfile(dish: Dish): FlavorProfile {
  return {
    spicy: dish.spicy,
    sweet: dish.sweet,
    sour: dish.sour,
    salty: dish.salty,
    umami: dish.umami,
    numbing: dish.numbing,
    bitter: dish.bitter,
    aromatic: dish.aromatic,
  }
}
