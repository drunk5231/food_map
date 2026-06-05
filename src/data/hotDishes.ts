/**
 * 热门菜品推荐 — 从各省份选取代表性菜品 ID
 */

/** 热门省份快捷入口 */
export interface HotProvince {
  id: string
  name: string
  emoji: string
}

export const hotProvinces: HotProvince[] = [
  { id: 'sichuan', name: '四川', emoji: '🌶️' },
  { id: 'guangdong', name: '广东', emoji: '🥟' },
  { id: 'hunan', name: '湖南', emoji: '🔥' },
  { id: 'shandong', name: '山东', emoji: '🐟' },
  { id: 'jiangsu', name: '江苏', emoji: '🏯' },
]

/** 热门推荐菜品 ID 列表（按省份各选一道代表作） */
export const hotDishIds: string[] = [
  'sichuan_mapo_tofu', // 四川 · 麻婆豆腐
  'guangdong_dim_sum', // 广东 · 广式早茶
  'hunan_dujiao_yutou', // 湖南 · 剁椒鱼头
  'shandong_tangcu_liyu', // 山东 · 糖醋鲤鱼
  'jiangsu_shizi_tou', // 江苏 · 清炖蟹粉狮子头
  'beijing_roast_duck', // 北京 · 北京烤鸭
  'chongqing_huoguo', // 重庆 · 重庆火锅
  'yunnan_cross_bridge_rice_noodle', // 云南 · 过桥米线
]
