import type { Achievement } from '../types'

export const achievements: Achievement[] = [
  {
    id: 'first_taste',
    name: '初尝百味',
    description: '收藏第一道美食',
    icon: '🌟',
  },
  {
    id: 'foodie_beginner',
    name: '美食学徒',
    description: '收藏 10 道美食',
    icon: '📚',
  },
  {
    id: 'foodie_master',
    name: '美食大家',
    description: '收藏 50 道美食',
    icon: '👨‍🍳',
  },
  {
    id: 'spicy_king',
    name: '辣不怕',
    description: '收藏 10 道辣度 ≥ 7 的美食',
    icon: '🌶️',
  },
  {
    id: 'sweet_tooth',
    name: '甜党领袖',
    description: '收藏 10 道甜度 ≥ 5 的美食',
    icon: '🍬',
  },
  {
    id: 'province_explorer_5',
    name: '五省游历',
    description: '收藏来自 5 个不同省份的美食',
    icon: '🗺️',
  },
  {
    id: 'province_explorer_10',
    name: '十省美食家',
    description: '收藏来自 10 个不同省份的美食',
    icon: '🧭',
  },
  {
    id: 'province_explorer_all',
    name: '吃遍中华',
    description: '收藏来自所有省份的美食',
    icon: '🏆',
  },
  {
    id: 'taste_test_done',
    name: '口味觉醒',
    description: '完成口味 DNA 测试',
    icon: '🧬',
  },
  {
    id: 'wishlist_10',
    name: '美食愿望单',
    description: '加入 10 道「想吃」美食',
    icon: '💫',
  },
  {
    id: 'eaten_10',
    name: '吃过见过',
    description: '标记 10 道「已吃过」',
    icon: '✅',
  },
  {
    id: 'eaten_50',
    name: '老饕',
    description: '标记 50 道「已吃过」',
    icon: '🎩',
  },
  {
    id: 'eight_cuisines',
    name: '八大菜系通关',
    description: '收藏涵盖八大菜系的美食',
    icon: '👑',
  },
  {
    id: 'night_owl',
    name: '深夜食堂',
    description: '在 22:00-06:00 使用美食时钟',
    icon: '🌙',
  },
  {
    id: 'early_bird',
    name: '早起的鸟儿',
    description: '在 06:00-08:00 使用美食时钟',
    icon: '🐦',
  },
]
