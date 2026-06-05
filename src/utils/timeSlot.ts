/**
 * 获取当前时段（美食时钟用）
 */
export type TimeSlot =
  | 'breakfast'    // 06:00-09:00
  | 'morning_tea'  // 09:00-11:00
  | 'lunch'        // 11:00-13:00
  | 'afternoon'    // 13:00-16:00
  | 'dinner'       // 16:00-19:00
  | 'supper'       // 19:00-22:00
  | 'late_night'   // 22:00-06:00

export interface TimeSlotInfo {
  slot: TimeSlot
  label: string
  icon: string
  description: string
  /** 详细描述 */
  detailedDescription: string
  /** 此时段适合的烹饪方式 */
  cookingMethods: string[]
  /** 时段对应的节气养生建议 */
  healthTip: string
  /** 时段主题色（用于渐变动画） */
  themeColor: string
}

const timeSlotDetails: Record<TimeSlot, Omit<TimeSlotInfo, 'slot'>> = {
  breakfast: {
    label: '早餐',
    icon: '🌅',
    description: '一日之计在于晨',
    detailedDescription: '早餐是一天中最重要的一餐，经过一夜的睡眠，身体急需补充能量。一顿营养均衡的早餐能唤醒肠胃、提升精神，为一整天的工作和学习提供动力。建议搭配碳水化合物、蛋白质和少量蔬果。',
    cookingMethods: ['蒸', '煮', '煎'],
    healthTip: '晨起宜温热饮食，忌生冷油腻。粥品、豆浆、馒头等温补脾胃，配合鸡蛋补充蛋白质，开启元气满满的一天。',
    themeColor: '#FFCCC7',
  },
  morning_tea: {
    label: '早茶',
    icon: '🍵',
    description: '偷得浮生半日闲',
    detailedDescription: '上午茶点源自广东饮茶文化，"一盅两件"是老广的生活智慧。这个时段适合享用精致的点心和小食，配上一壶好茶，既补充能量又不会影响午餐食欲。',
    cookingMethods: ['蒸', '烤', '凉拌'],
    healthTip: '上午茶宜清淡精致，配绿茶或花茶消食解腻。广式点心、时令水果、坚果小食皆为上选，既能补充体力又不过于饱腹。',
    themeColor: '#FFE7BA',
  },
  lunch: {
    label: '午餐',
    icon: '🌞',
    description: '补充能量正当时',
    detailedDescription: '午餐承上启下，是补充上午消耗、储备下午能量的关键一餐。应当荤素搭配、营养全面，主食与菜肴兼顾。中国饮食讲究"午吃饱"，一顿丰盛的午餐能让人精力充沛地度过下午。',
    cookingMethods: ['炒', '炖', '煮', '蒸'],
    healthTip: '午时（11-13点）心经当令，宜细嚼慢咽、七分饱为佳。荤素搭配，多食蔬菜，少油腻重口味，饭后小憩片刻更利于消化吸收。',
    themeColor: '#D9F7BE',
  },
  afternoon: {
    label: '下午茶',
    icon: '🧁',
    description: '午后小憩配点心',
    detailedDescription: '下午茶起源于英国，但中国自古也有午后品茗点心的传统。这个时段血糖容易下降，适当补充小食能提神醒脑、缓解疲劳。甜品、水果、茶点都是不错的选择。',
    cookingMethods: ['烤', '凉拌', '蒸'],
    healthTip: '午后宜饮红茶、乌龙茶提神。搭配少量甜点或水果补充能量，避免过量摄入糖分。此时段也是品尝时令水果的好时机。',
    themeColor: '#BAE7FF',
  },
  dinner: {
    label: '晚餐',
    icon: '🌆',
    description: '华灯初上觅美食',
    detailedDescription: '晚餐是一家人团聚的时刻，中国人的晚餐往往最为丰盛。从家常小炒到地方特色，晚餐承载着亲情与美食的双重温暖。建议晚餐不要过于丰盛，以免增加肠胃负担。',
    cookingMethods: ['炒', '炖', '煮', '烤', '凉拌'],
    healthTip: '晚餐饮食宜适量，"晚吃少"是养生之道。多食蔬菜和易消化的食物，少食油腻和高热量食物。晚餐时间不宜过晚，最好在睡前3小时完成。',
    themeColor: '#D3ADF7',
  },
  supper: {
    label: '夜宵',
    icon: '🌙',
    description: '夜宵江湖正热闹',
    detailedDescription: '夜宵文化是中国饮食的一大特色，从街边大排档到深夜面馆，热气腾腾的夜宵温暖着每一个夜归人。烧烤、小龙虾、砂锅粥……夜宵的魅力在于那份深夜里的人间烟火气。',
    cookingMethods: ['烤', '煮', '炒'],
    healthTip: '夜宵偶尔为之即可，不宜频繁。选择易消化的食物如粥品、面条，避免过于油腻辛辣。进食后不宜立即入睡，适当活动有助消化。',
    themeColor: '#B5A8D5',
  },
  late_night: {
    label: '深夜食堂',
    icon: '🌃',
    description: '深夜味蕾不打烊',
    detailedDescription: '深夜食堂源自日本文化，但中国的深夜同样不缺美食。一碗热汤、一份小食，足以抚慰深夜里疲惫的身心。深夜饮食以暖胃安神为主，简单而温暖。',
    cookingMethods: ['煮', '蒸'],
    healthTip: '深夜进食以暖胃安神为主，粥品、汤面等温热流食最佳。避免咖啡、浓茶等刺激性饮品，以免影响睡眠质量。',
    themeColor: '#ADC6FF',
  },
}

/** 所有时段列表（供选择器使用） */
export const ALL_TIME_SLOTS: TimeSlot[] = [
  'breakfast',
  'morning_tea',
  'lunch',
  'afternoon',
  'dinner',
  'supper',
  'late_night',
]

/** 时段对应小时范围（用于时钟高亮） */
export const timeSlotHours: Record<TimeSlot, { start: number; end: number }> = {
  breakfast: { start: 6, end: 9 },
  morning_tea: { start: 9, end: 11 },
  lunch: { start: 11, end: 13 },
  afternoon: { start: 13, end: 16 },
  dinner: { start: 16, end: 19 },
  supper: { start: 19, end: 22 },
  late_night: { start: 22, end: 6 },
}

export function getCurrentTimeSlot(date: Date = new Date()): TimeSlotInfo {
  const hour = date.getHours()
  let slot: TimeSlot

  if (hour >= 6 && hour < 9) slot = 'breakfast'
  else if (hour >= 9 && hour < 11) slot = 'morning_tea'
  else if (hour >= 11 && hour < 13) slot = 'lunch'
  else if (hour >= 13 && hour < 16) slot = 'afternoon'
  else if (hour >= 16 && hour < 19) slot = 'dinner'
  else if (hour >= 19 && hour < 22) slot = 'supper'
  else slot = 'late_night'

  return { slot, ...timeSlotDetails[slot] }
}

/** 根据时段key获取时段详情 */
export function getTimeSlotInfo(slot: TimeSlot): TimeSlotInfo {
  return { slot, ...timeSlotDetails[slot] }
}

/**
 * 时段对应的推荐美食类别
 */
export const timeSlotCategories: Record<TimeSlot, string[]> = {
  breakfast: ['staple', 'snack', 'soup'],
  morning_tea: ['snack', 'dessert', 'cold_dish'],
  lunch: ['main', 'staple', 'soup'],
  afternoon: ['dessert', 'snack', 'cold_dish'],
  dinner: ['main', 'staple', 'soup', 'cold_dish'],
  supper: ['street_food', 'snack', 'main'],
  late_night: ['street_food', 'snack', 'soup'],
}
