import { memo, useCallback, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import ChinaMap from '../components/map/ChinaMap'
import DishCard from '../components/dish/DishCard'
import { useDishCardActions } from '../hooks/useDishCardActions'
import { useHomePageData } from '../hooks/useHomePageData'
import { hotProvinces } from '../data/hotDishes'
import { provinceMeta } from '../data/provinces'
import { cn } from '../utils/cn'
import type { Dish } from '../types'

const DishDetailModal = lazy(() => import('../components/dish/DishDetailModal'))

/* ============================================================
 * 功能入口配置
 * ============================================================ */
const features = [
  {
    icon: '🗺️',
    label: '点击省份',
    desc: '探索各地美食',
    gradient: 'from-red-500 to-orange-500',
    darkGradient: 'dark:from-red-600 dark:to-orange-600',
    href: null,
  },
  {
    icon: '🧬',
    label: '口味测试',
    desc: '发现你的口味DNA',
    gradient: 'from-purple-500 to-pink-500',
    darkGradient: 'dark:from-purple-600 dark:to-pink-600',
    href: '/taste-test',
  },
  {
    icon: '🕐',
    label: '美食时钟',
    desc: '此刻该吃什么',
    gradient: 'from-blue-500 to-cyan-500',
    darkGradient: 'dark:from-blue-600 dark:to-cyan-600',
    href: '/food-clock',
  },
  {
    icon: '❤️',
    label: '收藏足迹',
    desc: '记录你的美食之旅',
    gradient: 'from-pink-500 to-rose-500',
    darkGradient: 'dark:from-pink-600 dark:to-pink-600',
    href: '/favorites',
  },
]

/* ============================================================
 * 热门省份快捷选择
 * ============================================================ */
const QuickProvinceSelect = memo(function QuickProvinceSelect() {
  return (
    <div className="mt-4">
      <h2 className="text-sm font-bold mb-2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
        热门省份
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {hotProvinces.map((p) => {
          const meta = provinceMeta.find((m) => m.id === p.id)
          return (
            <Link
              key={p.id}
              to={`/province/${p.id}`}
              className="no-underline flex-shrink-0"
            >
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  'hover:scale-105 active:scale-95',
                  'bg-[var(--color-surface)] border border-[var(--color-border)]',
                  'dark:bg-[var(--color-dark-surface)] dark:border-[var(--color-dark-border)]'
                )}
              >
                <span className="text-base">{p.emoji}</span>
                <span className="text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
                  {p.name}
                </span>
                {meta && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
})

/* ============================================================
 * 热门菜品项（使用 useDishCardActions 稳定回调引用）
 * ============================================================ */
const HotDishItem = memo(function HotDishItem({
  dish,
  onClick,
}: {
  dish: Dish
  onClick: (dish: Dish) => void
}) {
  const { isFavorite, isEaten, onToggleFavorite, onToggleEaten } = useDishCardActions(dish.id)
  const handleClick = useCallback(() => onClick(dish), [onClick, dish])
  return (
    <DishCard
      dish={dish}
      isFavorite={isFavorite}
      isEaten={isEaten}
      onToggleFavorite={onToggleFavorite}
      onToggleEaten={onToggleEaten}
      onClick={handleClick}
    />
  )
})

/* ============================================================
 * 热门菜品推荐
 * ============================================================ */
const HotDishesSection = memo(function HotDishesSection({
  hotDishes,
  selectedDish,
  onDishClick,
  onCloseModal,
}: {
  hotDishes: Dish[]
  selectedDish: Dish | null
  onDishClick: (dish: Dish) => void
  onCloseModal: () => void
}) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3 text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
        🔥 热门推荐
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hotDishes.map((dish) => (
          <HotDishItem
            key={dish.id}
            dish={dish}
            onClick={onDishClick}
          />
        ))}
      </div>

      {selectedDish && (
        <Suspense fallback={null}>
          <DishDetailModal dish={selectedDish} onClose={onCloseModal} />
        </Suspense>
      )}
    </div>
  )
})

/* ============================================================
 * 用户统计概览
 * ============================================================ */
interface StatItem {
  label: string
  icon: string
  count: number
  gradient: string
  darkGradient: string
}

const UserStatsSection = memo(function UserStatsSection({
  stats,
}: {
  stats: StatItem[]
}) {
  return (
    <div className="mt-6 mb-4">
      <h2 className="text-lg font-bold mb-3 text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
        🧭 我的美食之旅
      </h2>
      <Link to="/favorites" className="no-underline">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className={cn(
                'relative overflow-hidden rounded-xl p-4 text-center',
                'transition-transform hover:scale-[1.03] active:scale-[0.98]',
                'cursor-pointer shadow-md',
                `bg-gradient-to-br ${item.gradient} ${item.darkGradient}`
              )}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
              <span className="text-2xl block mb-1" aria-hidden="true">
                {item.icon}
              </span>
              <div className="text-2xl font-bold text-white">{item.count}</div>
              <div className="text-xs text-white/80">{item.label}</div>
            </div>
          ))}
        </div>
      </Link>
    </div>
  )
})

/* ============================================================
 * 首页
 * ============================================================ */
export default function HomePage() {
  const { hotDishes, selectedDish, handleDishClick, handleCloseModal, stats } = useHomePageData()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 标题区 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-title-blue)]">
          🍜 味觉地图
        </h1>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          探索中国每一个角落的美食，发现属于你的味道
        </p>
      </div>

      {/* 地图 */}
      <ChinaMap />

      {/* 热门省份快捷选择 */}
      <QuickProvinceSelect />

      {/* 底部功能入口 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((item) => {
          const card = (
            <div
              className={`relative overflow-hidden rounded-xl p-4 text-center cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98] ${
                item.href
                  ? `bg-gradient-to-br ${item.gradient} ${item.darkGradient} text-white shadow-lg feature-card-gradient`
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] dark:bg-[var(--color-dark-surface)] dark:border-[var(--color-dark-border)]'
              }`}
            >
              {item.href && (
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
              )}
              <span className="text-3xl mb-1.5 block" aria-hidden="true">
                {item.icon}
              </span>
              <div
                className={`text-sm font-bold ${
                  item.href
                    ? 'text-white'
                    : 'text-[var(--color-text)] dark:text-[var(--color-dark-text)]'
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-xs ${
                  item.href
                    ? 'text-white/80'
                    : 'text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]'
                }`}
              >
                {item.desc}
              </div>
            </div>
          )

          if (item.href) {
            return (
              <Link key={item.label} to={item.href} className="no-underline">
                {card}
              </Link>
            )
          }
          return (
            <div key={item.label}>{card}</div>
          )
        })}
      </div>

      {/* 搜索入口 */}
      <div className="mt-4">
        <Link
          to="/search"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 no-underline hover:border-[var(--color-primary)] transition-colors dark:bg-[var(--color-dark-surface)] dark:border-[var(--color-dark-border)] dark:hover:border-[var(--color-dark-primary)]"
        >
          <span className="text-xl">🔍</span>
          <div>
            <div className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
              搜索美食
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              按省份、口味、菜系搜索
            </div>
          </div>
        </Link>
      </div>

      {/* 热门菜品推荐 */}
      <HotDishesSection
        hotDishes={hotDishes}
        selectedDish={selectedDish}
        onDishClick={handleDishClick}
        onCloseModal={handleCloseModal}
      />

      {/* 用户统计概览 */}
      <UserStatsSection stats={stats} />
    </div>
  )
}
