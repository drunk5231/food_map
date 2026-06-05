import type { UserState, TasteTestRecord, FlavorProfile } from '../types'
import { STORAGE_KEYS, MAX_SEARCH_HISTORY, MAX_TASTE_HISTORY } from '../constants'
import { FLAVOR_KEYS } from './flavorProfile'

// ==================== 版本管理 ====================

const USER_STATE_VERSION = 1

function migrateUserState(data: Record<string, unknown>, fromVersion: number): UserState {
  // Version 0 → 1: ensure all required fields exist with defaults
  if (fromVersion < 1) {
    return {
      favorites: Array.isArray(data.favorites) ? data.favorites : [],
      eaten: Array.isArray(data.eaten) ? data.eaten : [],
      wantToEat: Array.isArray(data.wantToEat) ? data.wantToEat : [],
      visitedCounties: Array.isArray(data.visitedCounties) ? data.visitedCounties : [],
      tasteProfile: (data.tasteProfile && typeof data.tasteProfile === 'object' ? data.tasteProfile : null) as FlavorProfile | null,
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
    }
  }
  // Future migrations go here (e.g. if (fromVersion < 2) { ... })
  return { ...defaultState, ...data } as UserState
}

const defaultState: UserState = {
  favorites: [],
  eaten: [],
  wantToEat: [],
  visitedCounties: [],
  tasteProfile: null,
  achievements: [],
}

function isValidUserState(data: unknown): data is Record<string, unknown> {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  const arrayFields = ['favorites', 'eaten', 'wantToEat', 'visitedCounties', 'achievements'] as const
  for (const field of arrayFields) {
    if (field in obj) {
      if (!Array.isArray(obj[field])) return false
      if (!(obj[field] as unknown[]).every((item) => typeof item === 'string')) return false
    }
  }
  if ('tasteProfile' in obj && obj.tasteProfile !== null && typeof obj.tasteProfile !== 'object') return false
  return true
}

export function loadUserState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATE)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!isValidUserState(parsed)) return { ...defaultState }

    // Check stored version and migrate if necessary
    const storedVersion = typeof parsed._version === 'number' ? parsed._version : 0
    if (storedVersion < USER_STATE_VERSION) {
      const migrated = migrateUserState(parsed, storedVersion)
      saveUserState(migrated)
      return migrated
    }

    // Strip _version before returning to match UserState shape
    const state = { ...parsed }
    delete state._version
    return { ...defaultState, ...state } as UserState
  } catch {
    return { ...defaultState }
  }
}

export function saveUserState(state: UserState): void {
  try {
    const serializable = { ...state, _version: USER_STATE_VERSION } as Record<string, unknown>
    localStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(serializable))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[storage] localStorage quota exceeded while saving user state')
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded', { detail: { key: 'userState' } }))
    }
  }
}

export function clearUserState(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_STATE)
}

// ==================== 同步时间戳 ====================

const SYNC_TIMESTAMP_KEY = 'food-map-sync-timestamp'

export function loadSyncTimestamp(): number {
  try {
    const raw = localStorage.getItem(SYNC_TIMESTAMP_KEY)
    if (!raw) return 0
    return Number(raw) || 0
  } catch {
    return 0
  }
}

export function saveSyncTimestamp(ts: number): void {
  try {
    localStorage.setItem(SYNC_TIMESTAMP_KEY, String(ts))
  } catch {
    // ignore storage errors for timestamp
  }
}

// ==================== 搜索历史 ====================

export function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function saveSearchHistory(history: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY,JSON.stringify(history))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[storage] localStorage quota exceeded while saving search history')
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded', { detail: { key: 'searchHistory' } }))
    }
  }
}

export function addSearchHistory(keyword: string): string[] {
  const trimmed = keyword.trim()
  if (!trimmed) return loadSearchHistory()
  const history = loadSearchHistory().filter((item) => item !== trimmed)
  history.unshift(trimmed)
  const newHistory = history.slice(0, MAX_SEARCH_HISTORY)
  saveSearchHistory(newHistory)
  return newHistory
}

export function removeSearchHistoryItem(keyword: string): string[] {
  const history = loadSearchHistory().filter((item) => item !== keyword)
  saveSearchHistory(history)
  return history
}

export function clearSearchHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
}

// ==================== 口味测试历史 ====================

function isValidFlavorProfile(profile: unknown): profile is FlavorProfile {
  if (typeof profile !== 'object' || profile === null) return false
  const obj = profile as Record<string, unknown>
  return FLAVOR_KEYS.every((key) => typeof obj[key] === 'number')
}

function isValidTasteTestRecord(r: unknown): r is TasteTestRecord {
  if (typeof r !== 'object' || r === null) return false
  const obj = r as Record<string, unknown>
  if (typeof obj.timestamp !== 'number') return false
  if (!isValidFlavorProfile(obj.profile)) return false
  if (!Array.isArray(obj.topDishIds) || !obj.topDishIds.every((id: unknown) => typeof id === 'string')) return false
  return true
}

export function loadTasteHistory(): TasteTestRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASTE_HISTORY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTasteTestRecord)
  } catch {
    return []
  }
}

export function saveTasteHistory(history: TasteTestRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASTE_HISTORY,JSON.stringify(history))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[storage] localStorage quota exceeded while saving taste test history')
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded', { detail: { key: 'tasteHistory' } }))
    }
  }
}

export function addTasteTestRecord(record: TasteTestRecord): TasteTestRecord[] {
  const history = loadTasteHistory()
  history.unshift(record)
  const newHistory = history.slice(0, MAX_TASTE_HISTORY)
  saveTasteHistory(newHistory)
  return newHistory
}

export function clearTasteHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.TASTE_HISTORY)
}
