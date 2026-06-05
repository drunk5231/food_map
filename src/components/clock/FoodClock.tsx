import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import type { Dish } from '../../types'
import { getCurrentSolarTerm } from '../../utils/solarTerm'
import {
  getCurrentTimeSlot,
  getTimeSlotInfo,
  timeSlotCategories,
  timeSlotHours,
  type TimeSlot,
  type TimeSlotInfo,
} from '../../utils/timeSlot'
import { solarTerms } from '../../data/solarTerms'
import DishCard from '../dish/DishCard'
import { cn } from '../../utils/cn'
import DishDetailModal from '../dish/DishDetailModal'
import SolarTermDetailModal from './SolarTermDetailModal'
import { useApp } from '../../context/AppContext'

interface FoodClockProps {
  allDishes: Dish[]
}

// ==================== 时钟静态几何 ====================

const CLOCK_SEGMENTS = [
  { start: 6, end: 9, color: '#FFCCC7' },
  { start: 9, end: 11, color: '#FFE7BA' },
  { start: 11, end: 13, color: '#D9F7BE' },
  { start: 13, end: 16, color: '#BAE7FF' },
  { start: 16, end: 19, color: '#FFE7BA' },
  { start: 19, end: 22, color: '#D3ADF7' },
  { start: 22, end: 30, color: '#ADC6FF' },
].map((seg) => {
  const startAngle = ((seg.start % 12) / 12) * 360 - 90
  const endAngle = (((seg.end % 12) || 12) / 12) * 360 - 90
  const r = 82
  let sweep = endAngle - startAngle
  if (sweep <= 0) sweep += 360
  const largeArc = sweep > 180 ? 1 : 0
  const x1 = 100 + r * Math.cos((startAngle * Math.PI) / 180)
  const y1 = 100 + r * Math.sin((startAngle * Math.PI) / 180)
  const x2 = 100 + r * Math.cos((endAngle * Math.PI) / 180)
  const y2 = 100 + r * Math.sin((endAngle * Math.PI) / 180)
  return { d: `M 100 100 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: seg.color, start: seg.start, end: seg.end }
})

const HOUR_TICKS = Array.from({ length: 12 }, (_, i) => {
  const angle = ((i * 30) - 90) * (Math.PI / 180)
  return {
    x1: 100 + 80 * Math.cos(angle), y1: 100 + 80 * Math.sin(angle),
    x2: 100 + 88 * Math.cos(angle), y2: 100 + 88 * Math.sin(angle),
  }
})

const HOUR_NUMBERS = Array.from({ length: 12 }, (_, i) => {
  const angle = ((i * 30) - 90) * (Math.PI / 180)
  return { hour: i === 0 ? 12 : i, x: 100 + 72 * Math.cos(angle), y: 100 + 72 * Math.sin(angle) }
})

// 时段选择器配置
const TIME_SLOT_SELECTOR: { slot: TimeSlot; label: string; icon: string }[] = [
  { slot: 'breakfast', label: '早餐', icon: '🌅' },
  { slot: 'morning_tea', label: '早茶', icon: '🍵' },
  { slot: 'lunch', label: '午餐', icon: '🌞' },
  { slot: 'afternoon', label: '下午茶', icon: '🧁' },
  { slot: 'dinner', label: '晚餐', icon: '🌆' },
  { slot: 'supper', label: '夜宵', icon: '🌙' },
  { slot: 'late_night', label: '深夜', icon: '🌃' },
]

// ==================== 子组件 ====================

/** 时钟 SVG 组件 */
const ClockSVG = memo(function ClockSVG({
  hourAngle,
  minuteAngle,
  currentHour,
  activeSlot,
  slotLabel,
}: {
  hourAngle: number
  minuteAngle: number
  currentHour: number
  activeSlot: TimeSlot | null
  slotLabel: string
}) {
  // 判断某个时段是否是当前激活的时段
  const isActiveSegment = useCallback((segStart: number, segEnd: number) => {
    if (!activeSlot) return false
    const slotHours = timeSlotHours[activeSlot]
    if (!slotHours) return false
    // 处理跨午夜的情况 (late_night: 22-6)
    if (slotHours.end <= slotHours.start) {
      return segStart >= slotHours.start || segEnd <= slotHours.end
    }
    return segStart >= slotHours.start && segEnd <= slotHours.end
  }, [activeSlot])

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" role="img" aria-label={`美食时钟，当前时段：${slotLabel}`}>
      {/* 外圈 */}
      <circle cx="100" cy="100" r="95" fill="var(--svg-bg)" stroke="var(--svg-border)" strokeWidth="2" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="var(--svg-border)" strokeWidth="0.5" />

      {/* 时段色块 */}
      {CLOCK_SEGMENTS.map((seg, i) => (
        <path
          key={i}
          d={seg.d}
          fill={seg.color}
          opacity={isActiveSegment(seg.start, seg.end) ? 0.7 : 0.3}
          className="segment-transition"
        />
      ))}

      {/* 时刻度 */}
      {HOUR_TICKS.map((tick, i) => (
        <line key={i} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke="var(--svg-text)" strokeWidth="1.5" />
      ))}

      {/* 数字 */}
      {HOUR_NUMBERS.map((n) => (
        <text
          key={n.hour}
          x={n.x}
          y={n.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="var(--svg-text)"
          fontWeight={currentHour === n.hour ? '800' : '600'}
        >
          {n.hour}
        </text>
      ))}

      {/* 时针 */}
      <line
        x1="100" y1="100"
        x2={100 + 45 * Math.cos(((hourAngle - 90) * Math.PI) / 180)}
        y2={100 + 45 * Math.sin(((hourAngle - 90) * Math.PI) / 180)}
        stroke="var(--svg-text)" strokeWidth="3" strokeLinecap="round"
        className="clock-hand"
      />

      {/* 分针 */}
      <line
        x1="100" y1="100"
        x2={100 + 60 * Math.cos(((minuteAngle - 90) * Math.PI) / 180)}
        y2={100 + 60 * Math.sin(((minuteAngle - 90) * Math.PI) / 180)}
        stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"
        className="clock-hand"
      />

      {/* 中心圆 */}
      <circle cx="100" cy="100" r="4" fill="var(--color-primary)" />
    </svg>
  )
})

/** 时段选择器 */
const TimeSlotSelector = memo(function TimeSlotSelector({
  activeSlot,
  onSelect,
}: {
  activeSlot: TimeSlot
  onSelect: (slot: TimeSlot) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
      {TIME_SLOT_SELECTOR.map((item) => (
        <button
          key={item.slot}
          onClick={() => onSelect(item.slot)}
          className={cn(
            'time-slot-btn px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
            activeSlot === item.slot
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] active dark:bg-[var(--color-dark-primary)] dark:border-[var(--color-dark-primary)]'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:bg-[var(--color-dark-surface)] dark:text-[var(--color-dark-text-secondary)] dark:border-[var(--color-dark-border)] dark:hover:border-[var(--color-dark-primary)] dark:hover:text-[var(--color-dark-primary)]'
          )}
          aria-pressed={activeSlot === item.slot}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  )
})

/** 时段详情面板 */
const TimeSlotDetail = memo(function TimeSlotDetail({
  timeSlotInfo,
}: {
  timeSlotInfo: TimeSlotInfo
}) {
  return (
    <div className="slot-color-transition space-y-3">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
          {timeSlotInfo.detailedDescription}
        </p>
      </div>

      {/* 适合的烹饪方式 */}
      <div>
        <h4 className="text-xs font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-1.5 uppercase tracking-wide">
          推荐烹饪方式
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {timeSlotInfo.cookingMethods.map((method) => (
            <span
              key={method}
              className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-full dark:bg-[var(--color-dark-accent)]/15 dark:text-[var(--color-dark-accent)]"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* 养生建议 */}
      <div className="bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)]/30 rounded-xl p-3 border border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
          💡 {timeSlotInfo.healthTip}
        </p>
      </div>
    </div>
  )
})

/** 推荐菜品网格 */
const DishRecommendationGrid = memo(function DishRecommendationGrid({
  dishes,
  title,
  delayBase = 0,
}: {
  dishes: Dish[]
  title: string
  delayBase?: number
}) {
  const { favoriteSet, eatenSet, toggleFavorite, toggleEaten } = useApp()
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const handleCloseDetail = useCallback(() => setSelectedDish(null), [])

  if (dishes.length === 0) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-4">
          {title}
        </h3>
        <div className="text-center py-8 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          <div className="text-3xl mb-2">🍽️</div>
          <p>暂无该时段的推荐菜品</p>
          <p className="text-xs mt-1 opacity-70">试试切换其他时段看看</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dishes.map((dish, i) => (
          <div
            key={dish.id}
            className="dish-fade-in"
            style={{ animationDelay: `${delayBase + i * 0.06}s` }}
          >
            <DishCard
              dish={dish}
              isFavorite={favoriteSet.has(dish.id)}
              isEaten={eatenSet.has(dish.id)}
              onToggleFavorite={() => toggleFavorite(dish.id)}
              onToggleEaten={() => toggleEaten(dish.id)}
              onClick={() => setSelectedDish(dish)}
            />
          </div>
        ))}
      </div>
      {selectedDish && (
        <DishDetailModal dish={selectedDish} onClose={handleCloseDetail} />
      )}
    </div>
  )
})

// ==================== 主组件 ====================

export default function FoodClock({ allDishes }: FoodClockProps) {
  const [now, setNow] = useState(new Date())
  const [previewSlot, setPreviewSlot] = useState<TimeSlot | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<typeof solarTerms[number] | null>(null)
  const [dishDetailFromEvent, setDishDetailFromEvent] = useState<Dish | null>(null)

  // 每分钟更新时间
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  // 监听来自 SolarTermDetailModal 的菜品点击事件
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      // Validate detail has the expected Dish shape before using
      if (detail && typeof detail === 'object' && typeof detail.id === 'string' && typeof detail.name === 'string') {
        setDishDetailFromEvent(detail as Dish)
      }
    }
    window.addEventListener('open-dish-detail', handler)
    return () => window.removeEventListener('open-dish-detail', handler)
  }, [])

  const realTimeSlot: TimeSlotInfo = useMemo(() => getCurrentTimeSlot(now), [now])
  const currentTerm = useMemo(() => getCurrentSolarTerm(now), [now])

  // 当前显示的时段（可能是预览或真实时段）
  const activeSlot = previewSlot ?? realTimeSlot.slot
  const displayTimeSlot: TimeSlotInfo = useMemo(
    () => (previewSlot ? getTimeSlotInfo(previewSlot) : realTimeSlot),
    [previewSlot, realTimeSlot]
  )

  // 根据时段推荐美食
  const timeRecommendations = useMemo(() => {
    const categories = timeSlotCategories[activeSlot] ?? []
    return allDishes
      .filter((d) => categories.includes(d.category))
      .slice(0, 6)
  }, [allDishes, activeSlot])

  // 根据节气推荐美食
  const termRecommendations = useMemo(() => {
    if (!currentTerm) return []
    return allDishes
      .filter(
        (d) =>
          d.related_solar_terms.includes(currentTerm.name) ||
          d.related_solar_terms.includes(currentTerm.id)
      )
      .slice(0, 6)
  }, [allDishes, currentTerm])

  // 节气详情弹窗中的推荐菜品
  const selectedTermDishes = useMemo(() => {
    if (!selectedTerm) return []
    return allDishes
      .filter(
        (d) =>
          d.related_solar_terms.includes(selectedTerm.name) ||
          d.related_solar_terms.includes(selectedTerm.id)
      )
      .slice(0, 6)
  }, [allDishes, selectedTerm])

  // 时钟角度
  const { hourAngle, minuteAngle } = useMemo(() => ({
    hourAngle: ((now.getHours() % 12) / 12) * 360 + (now.getMinutes() / 60) * 30,
    minuteAngle: (now.getMinutes() / 60) * 360,
  }), [now])

  const currentHour = now.getHours()

  // 回调
  const handleSelectSlot = useCallback((slot: TimeSlot) => {
    setPreviewSlot((prev) => (prev === slot ? null : slot))
  }, [])

  const handleBackToNow = useCallback(() => {
    setPreviewSlot(null)
  }, [])

  const handleTermClick = useCallback((term: typeof solarTerms[number]) => {
    setSelectedTerm(term)
  }, [])

  const handleCloseTermModal = useCallback(() => {
    setSelectedTerm(null)
  }, [])

  const handleCloseDishDetailFromEvent = useCallback(() => {
    setDishDetailFromEvent(null)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }} role="group" aria-label="美食时钟">
      {/* 标题 */}
      <div className="text-center mb-8">
        <div className="text-4xl sm:text-5xl mb-3 clock-pulse">🕐</div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-1">美食时钟</h2>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">根据当前时间与节气，为你推荐此刻该吃的美食</p>
      </div>

      {/* 时钟面板 */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center mb-10">
        {/* 时钟 */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 shrink-0">
          <ClockSVG
            hourAngle={hourAngle}
            minuteAngle={minuteAngle}
            currentHour={currentHour}
            activeSlot={activeSlot}
            slotLabel={displayTimeSlot.label}
          />
        </div>

        {/* 当前信息 */}
        <div className="flex-1 text-center md:text-left">
          <div className="text-4xl sm:text-5xl mb-2">{displayTimeSlot.icon}</div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-1">
            {displayTimeSlot.label}
            {previewSlot && (
              <span className="ml-2 text-xs font-normal text-[var(--color-primary)] dark:text-[var(--color-dark-primary)] bg-[var(--color-primary)]/10 dark:bg-[var(--color-dark-primary)]/15 px-2 py-0.5 rounded-full">
                预览中
              </span>
            )}
          </h3>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
            {displayTimeSlot.description}
          </p>

          <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            <p>
              🕐 {now.getHours().toString().padStart(2, '0')}:
              {now.getMinutes().toString().padStart(2, '0')}
              {previewSlot && (
                <button
                  onClick={handleBackToNow}
                  className="ml-3 text-xs text-[var(--color-primary)] dark:text-[var(--color-dark-primary)] underline underline-offset-2 hover:no-underline cursor-pointer"
                >
                  回到当前时段
                </button>
              )}
            </p>
            {currentTerm && (
              <p className="mt-1">
                🌿 当前节气：<span className="font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">{currentTerm.name}</span>
                {currentTerm.food_advice && (
                  <span className="block mt-1 text-xs">{currentTerm.food_advice}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 时段详情 */}
      <div className="mb-8">
        <TimeSlotDetail timeSlotInfo={displayTimeSlot} />
      </div>

      {/* 时段快速切换 */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
          🔄 查看其他时段
        </h3>
        <TimeSlotSelector activeSlot={activeSlot} onSelect={handleSelectSlot} />
      </div>

      {/* 时段推荐 */}
      <DishRecommendationGrid
        key={`time-${activeSlot}`}
        dishes={timeRecommendations}
        title={`${displayTimeSlot.icon} ${displayTimeSlot.label}推荐`}
      />

      {/* 节气推荐 */}
      {currentTerm && (
        <DishRecommendationGrid
          key={`term-${currentTerm.id}`}
          dishes={termRecommendations}
          title={`🌿 ${currentTerm.name}时令美食`}
          delayBase={0.3}
        />
      )}

      {/* 24节气列表 */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-4">📅 二十四节气饮食指南</h3>
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
          点击节气卡片查看详情
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {solarTerms.map((term) => (
            <button
              key={term.id}
              onClick={() => handleTermClick(term)}
              className={cn(
                'solar-term-card p-3 rounded-xl border text-sm text-left',
                currentTerm?.id === term.id
                  ? 'border-[var(--color-primary)] dark:border-[var(--color-dark-primary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-dark-primary)]/5'
                  : 'border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)]'
              )}
              aria-label={`${term.name}节气详情`}
            >
              <div className="font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">{term.name}</div>
              <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">{term.month}月{term.day}日</div>
              {term.food_advice && (
                <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mt-1 line-clamp-2">
                  {term.food_advice}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 节气详情弹窗 */}
      {selectedTerm && (
        <SolarTermDetailModal
          term={selectedTerm}
          termDishes={selectedTermDishes}
          onClose={handleCloseTermModal}
        />
      )}

      {/* 从节气弹窗触发的菜品详情 */}
      {dishDetailFromEvent && (
        <DishDetailModal
          dish={dishDetailFromEvent}
          onClose={handleCloseDishDetailFromEvent}
        />
      )}
    </div>
  )
}
