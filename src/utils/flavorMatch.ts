import type { Dish, FlavorProfile } from '../types'
import { FLAVOR_KEYS, dishToFlavorProfile } from './flavorProfile'

/**
 * 计算两组口味数据的欧氏距离
 * 值越小表示越相似
 */
export function flavorDistance(a: FlavorProfile, b: FlavorProfile): number {
  let sum = 0
  for (const k of FLAVOR_KEYS) {
    const diff = (a[k] || 0) - (b[k] || 0)
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

/**
 * 从口味测试结果计算口味画像
 * 将所有题目的得分累加后归一化到 0-10
 */
export function calculateTasteProfile(
  answers: Record<number, number>, // questionId → optionIndex
  questions: { id: number; options: { scores: Partial<FlavorProfile> }[] }[]
): FlavorProfile {
  const totals: FlavorProfile = {
    spicy: 0, sweet: 0, sour: 0, salty: 0,
    umami: 0, numbing: 0, bitter: 0, aromatic: 0,
  }

  for (const q of questions) {
    const optionIdx = answers[q.id]
    if (optionIdx === undefined) continue
    const scores = q.options[optionIdx]?.scores || {}
    for (const [key, val] of Object.entries(scores)) {
      if (key in totals) {
        totals[key as keyof FlavorProfile] += val
      }
    }
  }

  // 归一化到 0-10
  const max = Math.max(...Object.values(totals), 1)
  for (const key of Object.keys(totals) as (keyof FlavorProfile)[]) {
    totals[key] = Math.round((totals[key] / max) * 10 * 10) / 10
  }

  return totals
}

/**
 * 根据口味画像匹配美食，返回按匹配度排序的美食列表
 */
export function matchDishes(
  profile: FlavorProfile,
  dishes: Dish[],
  limit = 20
): { dish: Dish; score: number }[] {
  const scored = dishes.map((dish) => {
    const dishFlavors = dishToFlavorProfile(dish)
    const distance = flavorDistance(profile, dishFlavors)
    // 转换为 0-100 的匹配分（距离越小分越高）
    const MAX_FLAVOR_VALUE = 10
    const FLAVOR_DIMENSIONS = FLAVOR_KEYS.length
    const maxDist = Math.sqrt(FLAVOR_DIMENSIONS * MAX_FLAVOR_VALUE ** 2)
    const score = Math.round((1 - distance / maxDist) * 100)
    return { dish, score: Math.max(0, score) }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

/**
 * 从口味画像生成文字描述
 */
export function describeTasteProfile(profile: FlavorProfile): string {
  const entries = Object.entries(profile)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  if (entries.length === 0) return '口味均衡型'

  const top = entries.slice(0, 3)
  const labels: Record<string, string> = {
    spicy: '嗜辣', sweet: '爱甜', sour: '喜酸', salty: '重咸',
    umami: '追鲜', numbing: '好麻', bitter: '能苦', aromatic: '迷香',
  }

  return top.map(([k]) => labels[k] || k).join('·') + '型'
}

/** 菜系口味特征 */
const CUISINE_PROFILES: { name: string; profile: FlavorProfile }[] = [
  { name: '川菜', profile: { spicy: 9, sweet: 1, sour: 3, salty: 5, umami: 6, numbing: 8, bitter: 0, aromatic: 7 } },
  { name: '粤菜', profile: { spicy: 1, sweet: 3, sour: 1, salty: 3, umami: 9, numbing: 0, bitter: 1, aromatic: 5 } },
  { name: '鲁菜', profile: { spicy: 2, sweet: 3, sour: 2, salty: 7, umami: 7, numbing: 0, bitter: 0, aromatic: 5 } },
  { name: '苏菜', profile: { spicy: 1, sweet: 6, sour: 2, salty: 4, umami: 7, numbing: 0, bitter: 0, aromatic: 5 } },
  { name: '浙菜', profile: { spicy: 2, sweet: 4, sour: 2, salty: 3, umami: 8, numbing: 0, bitter: 0, aromatic: 5 } },
  { name: '闽菜', profile: { spicy: 2, sweet: 3, sour: 3, salty: 3, umami: 8, numbing: 0, bitter: 1, aromatic: 6 } },
  { name: '湘菜', profile: { spicy: 8, sweet: 1, sour: 4, salty: 5, umami: 6, numbing: 2, bitter: 1, aromatic: 6 } },
  { name: '徽菜', profile: { spicy: 3, sweet: 2, sour: 3, salty: 6, umami: 6, numbing: 0, bitter: 2, aromatic: 5 } },
]

/**
 * 根据口味画像推荐最匹配的菜系
 * 返回按匹配度排序的 { name, score }[]，最多 3 个
 */
export function getMatchedCuisines(profile: FlavorProfile): { name: string; score: number }[] {
  const scored = CUISINE_PROFILES.map((c) => {
    const distance = flavorDistance(profile, c.profile)
    const MAX_FLAVOR_VALUE = 10
    const FLAVOR_DIMENSIONS = FLAVOR_KEYS.length
    const maxDist = Math.sqrt(FLAVOR_DIMENSIONS * MAX_FLAVOR_VALUE ** 2)
    const score = Math.round((1 - distance / maxDist) * 100)
    return { name: c.name, score: Math.max(0, score) }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3)
}
