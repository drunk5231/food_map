import type { Dish, FlavorProfile } from '../types'
import { describeTasteProfile, getMatchedCuisines } from './flavorMatch'
import { categoryLabels, flavorLabels, provinceMeta } from '../data/provinces'

// ==================== Helpers ====================

/** Try Web Share API; fall back to clipboard. Shows alert on clipboard copy. */
async function shareOrCopy(text: string, title: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return
    } catch {
      /* share API unavailable */
    }
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(text)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'info', message: '已复制到剪贴板' } }))
  } catch {
    console.error('复制失败，请手动复制')
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'info', message: '复制失败，请手动复制' } }))
  }
}

// ==================== Public API ====================

/** Build a shareable summary for a single dish. */
export async function shareDish(dish: Dish) {
  const cat = categoryLabels[dish.category] || dish.category
  const tags = dish.tags.length > 0 ? dish.tags.join(' ') : ''
  const line = [
    `${dish.emoji} ${dish.name}（${cat}）`,
    dish.description ? dish.description : '',
    tags ? `#${tags}` : '',
    '—— 来自「食在有趣」中国美食探索',
  ]
    .filter(Boolean)
    .join('\n')

  await shareOrCopy(line, `推荐美食：${dish.name}`)
}

/** Build a shareable summary for a taste-test result. */
export async function shareTasteResult(
  profile: FlavorProfile,
  matchedDishes?: { dish: Dish; score: number }[]
) {
  const desc = describeTasteProfile(profile)
  const dims = (Object.keys(flavorLabels) as (keyof FlavorProfile)[])
    .filter((k) => profile[k] > 5)
    .map((k) => `${flavorLabels[k]} ${profile[k]}`)
    .join('、')

  const dishLines = matchedDishes && matchedDishes.length > 0
    ? '\n最匹配美食：' + matchedDishes
        .slice(0, 5)
        .map(({ dish, score }) => `${dish.emoji}${dish.name}(${score}%)`)
        .join('、')
    : ''

  const line = [
    `🧬 我的口味 DNA：${desc}`,
    dims ? `突出维度：${dims}` : '',
    dishLines,
    '来测测你的口味 DNA 吧！',
    '—— 来自「食在有趣」中国美食探索',
  ]
    .filter(Boolean)
    .join('\n')

  await shareOrCopy(line, '我的口味 DNA')
}

/** Build a shareable summary for favorites stats. */
export async function shareFavoritesStats(params: {
  profile: FlavorProfile
  total: number
  provinceCount: number
  eatenCount: number
  wantCount: number
}) {
  const { profile, total, provinceCount, eatenCount, wantCount } = params
  const desc = describeTasteProfile(profile)
  const cuisines = getMatchedCuisines(profile)
  const cuisineText = cuisines.map((c) => c.name).join('、')
  const totalProvinces = provinceMeta.length
  const coveragePercent = Math.round((provinceCount / totalProvinces) * 100)

  const line = [
    `🍜 我的美食画像`,
    `口味 DNA：${desc}`,
    `最搭菜系：${cuisineText}`,
    ``,
    `📊 收藏 ${total} 道 · 吃过 ${eatenCount} 道 · 想吃 ${wantCount} 道`,
    `🗺️ 足迹覆盖 ${provinceCount}/${totalProvinces} 省（${coveragePercent}%）`,
    ``,
    '来探索你的美食地图吧！',
    '—— 来自「食在有趣」中国美食探索',
  ]
    .join('\n')

  await shareOrCopy(line, '我的美食画像')
}
