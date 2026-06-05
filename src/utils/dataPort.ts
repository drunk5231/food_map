import { loadUserState, saveUserState, loadSearchHistory, loadTasteHistory } from './storage'

export function exportUserData(): string {
  const state = loadUserState()
  const searchHistory = loadSearchHistory()
  const tasteHistory = loadTasteHistory()
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userState: state,
    searchHistory,
    tasteHistory,
  }
  return JSON.stringify(data, null, 2)
}

export function downloadUserData(): void {
  const json = exportUserData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `味觉地图-数据备份-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

interface ImportResult {
  success: boolean
  message: string
}

export function importUserData(jsonString: string): ImportResult {
  try {
    const data = JSON.parse(jsonString)
    if (!data || typeof data !== 'object') return { success: false, message: '无效的数据格式' }
    if (data.version !== 1) return { success: false, message: `不支持的数据版本: ${data.version}` }
    if (!data.userState || typeof data.userState !== 'object') return { success: false, message: '缺少用户状态数据' }

    saveUserState(data.userState)
    // Search history and taste history are managed by their own functions
    // but we can restore them via localStorage directly
    if (Array.isArray(data.searchHistory)) {
      localStorage.setItem('food-map-search-history', JSON.stringify(data.searchHistory))
    }
    if (Array.isArray(data.tasteHistory)) {
      localStorage.setItem('food-map-taste-history', JSON.stringify(data.tasteHistory))
    }
    return { success: true, message: '数据导入成功！刷新页面查看。' }
  } catch {
    return { success: false, message: '数据解析失败，请检查文件格式' }
  }
}
