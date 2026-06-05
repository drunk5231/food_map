import { solarTerms } from '../data/solarTerms'
import type { SolarTerm } from '../types'

// 按时间顺序排列节气（模块级别缓存，避免每次调用都排序）
const sortedTerms = [...solarTerms].sort((a, b) => {
  const dayA = a.month * 100 + a.day
  const dayB = b.month * 100 + b.day
  return dayA - dayB
})

/**
 * 根据当前日期获取当前节气
 * 使用简化的节气日期计算（基于固定日期表）
 */
export function getCurrentSolarTerm(date: Date = new Date()): SolarTerm | null {
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 找到当前或最近的节气
  let current: SolarTerm | null = null
  for (const term of sortedTerms) {
    if (
      month > term.month ||
      (month === term.month && day >= term.day)
    ) {
      current = term
    } else {
      break
    }
  }

  // 如果还没到第一个节气，取最后一个（跨年）
  return current || sortedTerms[sortedTerms.length - 1]
}
