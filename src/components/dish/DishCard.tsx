import { memo, useCallback } from 'react'
import type { Dish } from '../../types'
import { categoryLabels, cookingMethodLabels } from '../../data/provinces'
import { cn } from '../../utils/cn'
import { renderDifficultyStars, getDifficultyAriaLabel } from '../../utils/difficulty'

const RECIPE_PREVIEW_LENGTH = 50

interface DishCardProps {
  dish: Dish
  isFavorite?: boolean
  isEaten?: boolean
  onToggleFavorite?: () => void
  onToggleEaten?: () => void
  onClick?: () => void
}

const DishCard = memo(function DishCard({
  dish,
  isFavorite,
  isEaten,
  onToggleFavorite,
  onToggleEaten,
  onClick,
}: DishCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.()
      }
    },
    [onClick]
  )

  return (
    <div
      className="card-hover bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 cursor-pointer dark:bg-[var(--color-dark-surface)] dark:border-[var(--color-dark-border)]"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={dish.name}
    >
      {/* 头部：emoji + 名称 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">{dish.emoji}</span>
          <div>
            <h3 className="font-bold text-base leading-tight text-[var(--color-text)] dark:text-[var(--color-dark-text)]">{dish.name}</h3>
            <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              {categoryLabels[dish.category] || dish.category}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={cn(
                'w-8 h-8 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer',
                isFavorite
                  ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-red-500 dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:hover:text-red-400'
              )}
              aria-label={isFavorite ? '取消收藏' : '收藏'}
            >
              <span aria-hidden="true">{isFavorite ? '❤️' : '🤍'}</span>
            </button>
          )}
          {onToggleEaten && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleEaten()
              }}
              className={cn(
                'w-8 h-8 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer',
                isEaten
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-green-600 dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:hover:text-green-400'
              )}
              aria-label={isEaten ? '取消已吃' : '标记已吃'}
            >
              <span aria-hidden="true">{isEaten ? '✅' : '⬜'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 描述 */}
      {dish.description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-2 dark:text-[var(--color-dark-text-secondary)]">
          {dish.description}
        </p>
      )}

      {/* 做法预览 */}
      {dish.recipe && (
        <p className="text-xs text-[var(--color-text-secondary)] mb-2 line-clamp-1 italic dark:text-[var(--color-dark-text-secondary)]">
          <span aria-hidden="true">🍳</span> {dish.recipe.slice(0, RECIPE_PREVIEW_LENGTH)}…
        </p>
      )}

      {/* 口味条 */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {dish.spicy > 0 && (
          <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded dark:bg-red-900/30 dark:text-red-400">
            <span aria-hidden="true">🌶️</span> 辣{dish.spicy}
          </span>
        )}
        {dish.sweet > 0 && (
          <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded dark:bg-orange-900/30 dark:text-orange-400">
            <span aria-hidden="true">🍬</span> 甜{dish.sweet}
          </span>
        )}
        {dish.sour > 0 && (
          <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded dark:bg-yellow-900/30 dark:text-yellow-400">
            <span aria-hidden="true">🍋</span> 酸{dish.sour}
          </span>
        )}
        {dish.umami > 0 && (
          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded dark:bg-green-900/30 dark:text-green-400">
            <span aria-hidden="true">🦐</span> 鲜{dish.umami}
          </span>
        )}
        {dish.numbing > 0 && (
          <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded dark:bg-purple-900/30 dark:text-purple-400">
            <span aria-hidden="true">⚡</span> 麻{dish.numbing}
          </span>
        )}
      </div>

      {/* 标签 */}
      <div className="flex gap-1 flex-wrap">
        {dish.cooking_methods.slice(0, 3).map((m) => (
          <span
            key={m}
            className="text-xs bg-[var(--color-bg)] text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)]"
          >
            {cookingMethodLabels[m] || m}
          </span>
        ))}
        {dish.difficulty > 0 && (
          <span
            className="text-xs bg-[var(--color-bg)] text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)]"
            aria-label={getDifficultyAriaLabel(dish.difficulty)}
          >
            {renderDifficultyStars(dish.difficulty)}
          </span>
        )}
        {dish.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded dark:bg-[var(--color-dark-primary)]/15 dark:text-[var(--color-dark-primary)]"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
})

export default DishCard
