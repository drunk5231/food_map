import { describe, it, expect } from 'vitest'
import { FLAVOR_KEYS, dishToFlavorProfile } from './flavorProfile'
import type { Dish } from '../types'

describe('FLAVOR_KEYS', () => {
  it('contains all 8 flavor dimensions', () => {
    expect(FLAVOR_KEYS).toHaveLength(8)
    expect(FLAVOR_KEYS).toEqual([
      'spicy', 'sweet', 'sour', 'salty',
      'umami', 'numbing', 'bitter', 'aromatic',
    ])
  })
})

describe('dishToFlavorProfile', () => {
  it('extracts flavor values from a Dish object', () => {
    const dish = {
      spicy: 7,
      sweet: 3,
      sour: 2,
      salty: 5,
      umami: 8,
      numbing: 1,
      bitter: 0,
      aromatic: 6,
    } as Dish

    const profile = dishToFlavorProfile(dish)
    expect(profile).toEqual({
      spicy: 7,
      sweet: 3,
      sour: 2,
      salty: 5,
      umami: 8,
      numbing: 1,
      bitter: 0,
      aromatic: 6,
    })
  })

  it('handles zero values', () => {
    const dish = {
      spicy: 0, sweet: 0, sour: 0, salty: 0,
      umami: 0, numbing: 0, bitter: 0, aromatic: 0,
    } as Dish

    const profile = dishToFlavorProfile(dish)
    for (const key of FLAVOR_KEYS) {
      expect(profile[key]).toBe(0)
    }
  })
})
