import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadUserState, saveUserState, clearUserState,
  addSearchHistory, loadSearchHistory, clearSearchHistory,
  addTasteTestRecord, loadTasteHistory, clearTasteHistory,
} from './storage'
import { STORAGE_KEYS } from '../constants'
import type { TasteTestRecord } from '../types'

beforeEach(() => {
  localStorage.clear()
})

describe('loadUserState', () => {
  it('returns default state when localStorage is empty', () => {
    const state = loadUserState()
    expect(state.favorites).toEqual([])
    expect(state.eaten).toEqual([])
    expect(state.wantToEat).toEqual([])
    expect(state.tasteProfile).toBeNull()
    expect(state.achievements).toEqual([])
  })

  it('loads saved state from localStorage', () => {
    const saved = { favorites: ['dish-1', 'dish-2'], eaten: ['dish-3'] }
    localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(saved))
    const state = loadUserState()
    expect(state.favorites).toEqual(['dish-1', 'dish-2'])
    expect(state.eaten).toEqual(['dish-3'])
  })

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem(STORAGE_KEYS.USER_STATE, 'not-json!!!')
    const state = loadUserState()
    expect(state.favorites).toEqual([])
  })

  it('merges with defaults for missing fields', () => {
    localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify({ favorites: ['x'] }))
    const state = loadUserState()
    expect(state.favorites).toEqual(['x'])
    expect(state.eaten).toEqual([])
    expect(state.achievements).toEqual([])
  })
})

describe('saveUserState', () => {
  it('saves state to localStorage', () => {
    const state = loadUserState()
    state.favorites = ['dish-1']
    saveUserState(state)
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATE)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.favorites).toEqual(['dish-1'])
  })
})

describe('clearUserState', () => {
  it('removes state from localStorage', () => {
    saveUserState(loadUserState())
    clearUserState()
    expect(localStorage.getItem(STORAGE_KEYS.USER_STATE)).toBeNull()
  })
})

// ==================== addSearchHistory ====================

describe('addSearchHistory', () => {
  beforeEach(() => {
    clearSearchHistory()
  })

  it('adds an item to search history', () => {
    const result = addSearchHistory('红烧肉')
    expect(result).toEqual(['红烧肉'])
    expect(loadSearchHistory()).toEqual(['红烧肉'])
  })

  it('deduplicates: moves existing item to the front', () => {
    addSearchHistory('红烧肉')
    addSearchHistory('宫保鸡丁')
    const result = addSearchHistory('红烧肉')
    expect(result).toEqual(['红烧肉', '宫保鸡丁'])
  })

  it('respects max limit of 20', () => {
    for (let i = 0; i < 25; i++) {
      addSearchHistory(`菜品${i}`)
    }
    const history = loadSearchHistory()
    expect(history.length).toBe(20)
    // Most recent should be first
    expect(history[0]).toBe('菜品24')
  })

  it('handles empty string gracefully', () => {
    addSearchHistory('红烧肉')
    const result = addSearchHistory('   ')
    // Empty/whitespace should not be added; returns current history unchanged
    expect(result).toEqual(['红烧肉'])
  })

  it('trims whitespace from keyword', () => {
    const result = addSearchHistory('  红烧肉  ')
    expect(result).toEqual(['红烧肉'])
  })
})

// ==================== addTasteTestRecord ====================

describe('addTasteTestRecord', () => {
  beforeEach(() => {
    clearTasteHistory()
  })

  const makeRecord = (ts: number): TasteTestRecord => ({
    timestamp: ts,
    profile: { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 },
    topDishIds: ['dish-1'],
  })

  it('adds a taste test record', () => {
    const record = makeRecord(1000)
    const result = addTasteTestRecord(record)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(record)
    expect(loadTasteHistory()).toHaveLength(1)
  })

  it('respects max limit of 10', () => {
    for (let i = 0; i < 15; i++) {
      addTasteTestRecord(makeRecord(i))
    }
    const history = loadTasteHistory()
    expect(history.length).toBe(10)
    // Most recent should be first
    expect(history[0].timestamp).toBe(14)
  })

  it('handles empty history', () => {
    expect(loadTasteHistory()).toEqual([])
    const record = makeRecord(500)
    const result = addTasteTestRecord(record)
    expect(result).toHaveLength(1)
  })

  it('prepends new records (newest first)', () => {
    addTasteTestRecord(makeRecord(1))
    addTasteTestRecord(makeRecord(2))
    addTasteTestRecord(makeRecord(3))
    const history = loadTasteHistory()
    expect(history[0].timestamp).toBe(3)
    expect(history[1].timestamp).toBe(2)
    expect(history[2].timestamp).toBe(1)
  })
})

// ==================== Enhanced validation: loadSearchHistory ====================

describe('loadSearchHistory validation', () => {
  beforeEach(() => {
    clearSearchHistory()
  })

  it('rejects non-string items in the array', () => {
    localStorage.setItem(
      STORAGE_KEYS.SEARCH_HISTORY,
      JSON.stringify(['valid', 123, null, true, 'also-valid', { nested: 'obj' }])
    )
    const history = loadSearchHistory()
    expect(history).toEqual(['valid', 'also-valid'])
  })
})

// ==================== Enhanced validation: loadTasteHistory ====================

describe('loadTasteHistory validation', () => {
  beforeEach(() => {
    clearTasteHistory()
  })

  it('rejects records with invalid profile (missing flavor keys)', () => {
    const validRecord = {
      timestamp: 1000,
      profile: { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 },
      topDishIds: ['dish-1'],
    }
    const invalidRecord = {
      timestamp: 2000,
      profile: { spicy: 5, sweet: 3 }, // missing most flavor keys
      topDishIds: ['dish-2'],
    }
    const anotherInvalid = {
      timestamp: 3000,
      profile: 'not-an-object',
      topDishIds: [],
    }
    localStorage.setItem(
      STORAGE_KEYS.TASTE_HISTORY,
      JSON.stringify([validRecord, invalidRecord, anotherInvalid])
    )
    const history = loadTasteHistory()
    expect(history).toHaveLength(1)
    expect(history[0].timestamp).toBe(1000)
  })

  it('rejects records with invalid topDishIds', () => {
    const validRecord = {
      timestamp: 1000,
      profile: { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 },
      topDishIds: ['dish-1'],
    }
    const invalidTopDishIds = {
      timestamp: 2000,
      profile: { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 },
      topDishIds: 'not-an-array',
    }
    const invalidTopDishIdsItems = {
      timestamp: 3000,
      profile: { spicy: 5, sweet: 3, sour: 2, salty: 4, umami: 6, numbing: 1, bitter: 0, aromatic: 7 },
      topDishIds: [123, 456],
    }
    localStorage.setItem(
      STORAGE_KEYS.TASTE_HISTORY,
      JSON.stringify([validRecord, invalidTopDishIds, invalidTopDishIdsItems])
    )
    const history = loadTasteHistory()
    expect(history).toHaveLength(1)
    expect(history[0].timestamp).toBe(1000)
  })
})
