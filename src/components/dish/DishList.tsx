import { memo, useState, useMemo, useCallback, useEffect } from 'react'
import type { Dish, DishCategory } from '../../types'
import DishCard from './DishCard'
import DishDetailModal from './DishDetailModal'
import { categoryLabels } from '../../data/provinces'
import { useDishCardActions } from '../../hooks/useDishCardActions'
import { cn } from '../../utils/cn'
import { SkeletonGrid } from '../ui/Skeleton'

interface DishListProps {
  dishes: Dish[]
  title?: string
  showFilter?: boolean
  loading?: boolean
}

const categories: (DishCategory | 'all')[] = [
  'all', 'main', 'snack', 'street_food', 'soup', 'cold_dish', 'dessert', 'staple', 'drink',
]

const PAGE_SIZE = 30

const DishListItem = memo(function DishListItem({
  dish,
  onSelect,
}: {
  dish: Dish
  onSelect: (id: string) => void
}) {
  const { isFavorite, isEaten, onToggleFavorite, onToggleEaten } = useDishCardActions(dish.id)
  const handleClick = useCallback(() => onSelect(dish.id), [onSelect, dish.id])
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

const DishList = memo(function DishList({
  dishes,
  title,
  showFilter = true,
  loading,
}: DishListProps) {
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<DishCategory | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const handleCloseDetail = useCallback(() => setSelectedDishId(null), [])
  const handleSelect = useCallback((id: string) => setSelectedDishId(id), [])

  // Reset visible count when category or dishes change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeCategory, dishes])

  const filtered = useMemo(
    () =>
      activeCategory === 'all'
        ? dishes
        : dishes.filter((d) => d.category === activeCategory),
    [dishes, activeCategory]
  )

  const selectedDish = useMemo(
    () => (selectedDishId ? filtered.find((d) => d.id === selectedDishId) ?? null : null),
    [filtered, selectedDishId]
  )

  if (loading) {
    return (
      <div>
        {title && (
          <h2 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">{title}</h2>
        )}
        <SkeletonGrid count={6} />
      </div>
    )
  }

  return (
    <div>
      {/* 标题 */}
      {title && (
        <h2 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">{title}</h2>
      )}

      {/* 分类筛选 */}
      {showFilter && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" role="group" aria-label="分类筛选">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={cn(
                'px-3 py-1.5 min-h-[36px] rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer',
                activeCategory === cat
                  ? 'bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white'
                  : 'bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-primary)] dark:hover:border-[var(--color-dark-primary)]'
              )}
            >
              {cat === 'all' ? '全部' : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* 数量 */}
      <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3" aria-live="polite" role="status">
        共 {filtered.length} 道美食
      </p>

      {/* 美食网格 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          <div className="text-3xl mb-2">🍃</div>
          <p>暂无数据</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.slice(0, visibleCount).map((dish) => (
              <DishListItem
                key={dish.id}
                dish={dish}
                onSelect={handleSelect}
              />
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-6 py-2 min-h-[44px] bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                加载更多（{filtered.length - visibleCount} 道剩余）
              </button>
            </div>
          )}
        </>
      )}

      {/* 详情面板（模态） */}
      {selectedDish && (
        <DishDetailModal dish={selectedDish} onClose={handleCloseDetail} />
      )}
    </div>
  )
})

export default DishList
