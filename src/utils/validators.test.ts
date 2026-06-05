import { describe, it, expect } from 'vitest'
import { isDish, isValidCacheEnvelope } from './validators'

describe('isDish', () => {
  const validDish = {
    id: 'test-1', name: '测试菜', province_id: 'beijing', category: 'main',
    spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7,
    cooking_methods: ['stir_fry'], main_ingredients: ['test'], difficulty: 3,
    tags: [], emoji: '🍜', description: 'test', recipe: null, story: null, history: null,
    best_season: 'all', related_solar_terms: [], created_at: '2024-01-01',
    county_id: null, pairing_drink: null, pairing_side: null, pairing_staple: null,
  }

  it('accepts a valid dish', () => expect(isDish(validDish)).toBe(true))
  it('rejects null', () => expect(isDish(null)).toBe(false))
  it('rejects empty object', () => expect(isDish({})).toBe(false))
  it('rejects missing id', () => expect(isDish({ ...validDish, id: '' })).toBe(false))
  it('rejects invalid category', () => expect(isDish({ ...validDish, category: 'invalid' })).toBe(false))
  it('rejects spicy > 10', () => expect(isDish({ ...validDish, spicy: 11 })).toBe(false))
  it('rejects negative flavor', () => expect(isDish({ ...validDish, sweet: -1 })).toBe(false))
  it('rejects non-number flavor', () => expect(isDish({ ...validDish, spicy: 'hot' })).toBe(false))
  it('rejects string input', () => expect(isDish('not a dish')).toBe(false))
  it('rejects array input', () => expect(isDish([validDish])).toBe(false))
})

describe('isValidCacheEnvelope', () => {
  it('accepts valid envelope', () => expect(isValidCacheEnvelope({ dishes: [], timestamp: Date.now(), version: 1 })).toBe(true))
  it('rejects missing dishes', () => expect(isValidCacheEnvelope({ timestamp: Date.now(), version: 1 })).toBe(false))
  it('rejects missing timestamp', () => expect(isValidCacheEnvelope({ dishes: [], version: 1 })).toBe(false))
  it('rejects missing version', () => expect(isValidCacheEnvelope({ dishes: [], timestamp: Date.now() })).toBe(false))
  it('rejects non-array dishes', () => expect(isValidCacheEnvelope({ dishes: 'nope', timestamp: 1, version: 1 })).toBe(false))
  it('rejects null', () => expect(isValidCacheEnvelope(null)).toBe(false))
})
