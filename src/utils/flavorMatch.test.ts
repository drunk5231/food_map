import { describe, it, expect } from 'vitest'
import { flavorDistance, calculateTasteProfile, matchDishes, describeTasteProfile } from './flavorMatch'
import type { Dish, FlavorProfile } from '../types'

const zero: FlavorProfile = {
  spicy: 0, sweet: 0, sour: 0, salty: 0,
  umami: 0, numbing: 0, bitter: 0, aromatic: 0,
}

function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: '1', name: 'Test', province_id: 'guangdong', county_id: null,
    category: 'snack', tags: [], cooking_methods: ['stir_fry'],
    main_ingredients: [], difficulty: 3, story: null, history: null,
    best_season: 'all', related_solar_terms: [], emoji: '🍜',
    description: null, pairing_drink: null, pairing_side: null,
    pairing_staple: null, created_at: '',
    spicy: 0, sweet: 0, sour: 0, salty: 0,
    umami: 0, numbing: 0, bitter: 0, aromatic: 0,
    ...overrides,
  } as Dish
}

describe('flavorDistance', () => {
  it('returns 0 for identical profiles', () => {
    const a: FlavorProfile = { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 }
    expect(flavorDistance(a, a)).toBe(0)
  })

  it('returns positive value for different profiles', () => {
    const a: FlavorProfile = { ...zero, spicy: 10 }
    const b: FlavorProfile = { ...zero, sweet: 10 }
    expect(flavorDistance(a, b)).toBeGreaterThan(0)
  })

  it('is symmetric', () => {
    const a: FlavorProfile = { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 }
    const b: FlavorProfile = { spicy: 1, sweet: 8, sour: 5, salty: 2, umami: 3, numbing: 9, bitter: 4, aromatic: 0 }
    expect(flavorDistance(a, b)).toBe(flavorDistance(b, a))
  })

  it('calculates correct euclidean distance', () => {
    const a: FlavorProfile = { ...zero, spicy: 3 }
    const b: FlavorProfile = { ...zero, spicy: 0 }
    // distance = sqrt(3^2) = 3
    expect(flavorDistance(a, b)).toBe(3)
  })
})

describe('calculateTasteProfile', () => {
  it('returns normalized profile with max 10', () => {
    const questions = [
      { id: 1, options: [{ scores: { spicy: 5 } }, { scores: { sweet: 3 } }] },
      { id: 2, options: [{ scores: { spicy: 3 } }, { scores: { umami: 2 } }] },
    ]
    const answers = { 1: 0, 2: 0 } // spicy: 5+3=8
    const profile = calculateTasteProfile(answers, questions)
    // spicy is the max (8), so normalized to 10
    expect(profile.spicy).toBe(10)
    // all values should be <= 10
    for (const key of Object.keys(profile)) {
      expect(profile[key as keyof FlavorProfile]).toBeLessThanOrEqual(10)
    }
  })

  it('handles empty answers', () => {
    const questions = [
      { id: 1, options: [{ scores: { spicy: 5 } }] },
    ]
    const profile = calculateTasteProfile({}, questions)
    // all values should be 0
    for (const key of Object.keys(profile)) {
      expect(profile[key as keyof FlavorProfile]).toBe(0)
    }
  })

  it('ignores invalid question ids', () => {
    const questions = [
      { id: 1, options: [{ scores: { spicy: 5 } }] },
    ]
    const answers = { 99: 0 } // non-existent question
    const profile = calculateTasteProfile(answers, questions)
    for (const key of Object.keys(profile)) {
      expect(profile[key as keyof FlavorProfile]).toBe(0)
    }
  })
})

describe('matchDishes', () => {
  it('returns dishes sorted by score descending', () => {
    const profile: FlavorProfile = { ...zero, spicy: 10 }
    const dishes = [
      makeDish({ id: '1', spicy: 0 }),
      makeDish({ id: '2', spicy: 9 }),
      makeDish({ id: '3', spicy: 5 }),
    ]
    const result = matchDishes(profile, dishes, 10)
    expect(result).toHaveLength(3)
    expect(result[0].dish.id).toBe('2')
    expect(result[0].score).toBeGreaterThan(result[1].score)
    expect(result[1].score).toBeGreaterThan(result[2].score)
  })

  it('respects limit parameter', () => {
    const dishes = Array.from({ length: 30 }, (_, i) => makeDish({ id: String(i) }))
    const result = matchDishes(zero, dishes, 5)
    expect(result).toHaveLength(5)
  })

  it('returns scores between 0 and 100', () => {
    const profile: FlavorProfile = { spicy: 5, sweet: 5, sour: 5, salty: 5, umami: 5, numbing: 5, bitter: 5, aromatic: 5 }
    const dishes = [makeDish({ spicy: 10, sweet: 10, sour: 10, salty: 10, umami: 10, numbing: 10, bitter: 10, aromatic: 10 })]
    const result = matchDishes(profile, dishes)
    expect(result[0].score).toBeGreaterThanOrEqual(0)
    expect(result[0].score).toBeLessThanOrEqual(100)
  })
})

describe('describeTasteProfile', () => {
  it('returns "口味均衡型" for zero profile', () => {
    expect(describeTasteProfile(zero)).toBe('口味均衡型')
  })

  it('returns top 3 flavor descriptors', () => {
    const profile: FlavorProfile = { spicy: 10, sweet: 8, sour: 6, salty: 0, umami: 0, numbing: 0, bitter: 0, aromatic: 0 }
    const desc = describeTasteProfile(profile)
    expect(desc).toContain('嗜辣')
    expect(desc).toContain('爱甜')
    expect(desc).toContain('喜酸')
    expect(desc).toContain('型')
  })

  it('returns single descriptor for one dominant flavor', () => {
    const profile: FlavorProfile = { ...zero, umami: 10 }
    expect(describeTasteProfile(profile)).toBe('追鲜型')
  })
})
