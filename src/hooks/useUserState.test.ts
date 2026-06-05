import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUserState } from './useUserState'
import { loadUserState } from '../utils/storage'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useUserState', () => {
  it('returns default state on first render', () => {
    const { result } = renderHook(() => useUserState())
    expect(result.current.state.favorites).toEqual([])
    expect(result.current.state.eaten).toEqual([])
    expect(result.current.state.wantToEat).toEqual([])
    expect(result.current.state.tasteProfile).toBeNull()
    expect(result.current.state.achievements).toEqual([])
    expect(result.current.state.visitedCounties).toEqual([])
  })

  it('toggleFavorite adds/removes dish IDs', () => {
    const { result } = renderHook(() => useUserState())

    act(() => {
      result.current.toggleFavorite('dish-1')
    })
    expect(result.current.state.favorites).toEqual(['dish-1'])

    act(() => {
      result.current.toggleFavorite('dish-2')
    })
    expect(result.current.state.favorites).toEqual(['dish-1', 'dish-2'])

    act(() => {
      result.current.toggleFavorite('dish-1')
    })
    expect(result.current.state.favorites).toEqual(['dish-2'])
  })

  it('toggleEaten adds/removes dish IDs', () => {
    const { result } = renderHook(() => useUserState())

    act(() => {
      result.current.toggleEaten('dish-1')
    })
    expect(result.current.state.eaten).toEqual(['dish-1'])

    act(() => {
      result.current.toggleEaten('dish-1')
    })
    expect(result.current.state.eaten).toEqual([])
  })

  it('toggleWantToEat adds/removes dish IDs', () => {
    const { result } = renderHook(() => useUserState())

    act(() => {
      result.current.toggleWantToEat('dish-1')
    })
    expect(result.current.state.wantToEat).toEqual(['dish-1'])

    act(() => {
      result.current.toggleWantToEat('dish-1')
    })
    expect(result.current.state.wantToEat).toEqual([])
  })

  it('setTasteProfile updates the profile', () => {
    const { result } = renderHook(() => useUserState())

    const profile = {
      spicy: 5,
      sweet: 3,
      sour: 2,
      salty: 4,
      umami: 6,
      numbing: 1,
      bitter: 0,
      aromatic: 7,
    }

    act(() => {
      result.current.setTasteProfile(profile)
    })
    expect(result.current.state.tasteProfile).toEqual(profile)
  })

  it('markProvinceVisited adds province ID', () => {
    const { result } = renderHook(() => useUserState())

    act(() => {
      result.current.markProvinceVisited('beijing')
    })
    expect(result.current.state.visitedCounties).toEqual(['beijing'])

    act(() => {
      result.current.markProvinceVisited('shanghai')
    })
    expect(result.current.state.visitedCounties).toEqual(['beijing', 'shanghai'])

    // Should not duplicate
    act(() => {
      result.current.markProvinceVisited('beijing')
    })
    expect(result.current.state.visitedCounties).toEqual(['beijing', 'shanghai'])
  })

  it('resetState clears everything', () => {
    const { result } = renderHook(() => useUserState())

    act(() => {
      result.current.toggleFavorite('dish-1')
      result.current.toggleEaten('dish-2')
      result.current.toggleWantToEat('dish-3')
      result.current.markProvinceVisited('beijing')
      result.current.setTasteProfile({
        spicy: 5,
        sweet: 3,
        sour: 2,
        salty: 4,
        umami: 6,
        numbing: 1,
        bitter: 0,
        aromatic: 7,
      })
    })

    act(() => {
      result.current.resetState()
    })

    expect(result.current.state.favorites).toEqual([])
    expect(result.current.state.eaten).toEqual([])
    expect(result.current.state.wantToEat).toEqual([])
    expect(result.current.state.visitedCounties).toEqual([])
    expect(result.current.state.tasteProfile).toBeNull()
    expect(result.current.state.achievements).toEqual([])
  })

  it('state persists to localStorage (debounced)', () => {
    const { result } = renderHook(() => useUserState())

    act(() => {
      result.current.toggleFavorite('dish-1')
    })

    // Before debounce fires, state is not yet in localStorage
    const beforeSave = loadUserState()
    expect(beforeSave.favorites).toEqual([])

    // Advance timer past the debounce period
    act(() => {
      vi.advanceTimersByTime(300)
    })

    const afterSave = loadUserState()
    expect(afterSave.favorites).toEqual(['dish-1'])
  })

  it('unlockAchievement adds achievement ID (no duplicates)', () => {
    const { result } = renderHook(() => useUserState())
    act(() => { result.current.unlockAchievement('first-bite') })
    expect(result.current.state.achievements).toEqual(['first-bite'])
    act(() => { result.current.unlockAchievement('first-bite') })
    expect(result.current.state.achievements).toEqual(['first-bite'])
  })

  it('replaceState replaces entire state', () => {
    const { result } = renderHook(() => useUserState())
    const newState = {
      favorites: ['a'], eaten: ['b'], wantToEat: [],
      visitedCounties: [], tasteProfile: null, achievements: [],
    }
    act(() => { result.current.replaceState(newState) })
    expect(result.current.state.favorites).toEqual(['a'])
    expect(result.current.state.eaten).toEqual(['b'])
  })
})
