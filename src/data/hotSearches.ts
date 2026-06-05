/** 热门搜索数据 */

export interface HotSearchCategory {
  label: string
  icon: string
  items: string[]
}

export const hotSearchCategories: HotSearchCategory[] = [
  {
    label: '热门菜名',
    icon: '🍜',
    items: [
      '火锅',
      '麻婆豆腐',
      '宫保鸡丁',
      '东坡肉',
      '小笼包',
      '烤鸭',
      '螺蛳粉',
      '热干面',
      '酸菜鱼',
      '红烧肉',
    ],
  },
  {
    label: '热门食材',
    icon: '🥬',
    items: [
      '辣椒',
      '花椒',
      '豆腐',
      '猪肉',
      '牛肉',
      '虾',
      '蘑菇',
      '莲藕',
      '竹笋',
      '面条',
    ],
  },
  {
    label: '热门标签',
    icon: '🏷️',
    items: [
      '麻辣',
      '清淡',
      '家常',
      '下饭',
      '快手菜',
      '养生',
      '夜宵',
      '早餐',
      '宴客',
      '儿童',
    ],
  },
]
