import { memo, useMemo } from 'react'
import type { Dish, Season } from '../../types'
import { categoryLabels, cookingMethodLabels } from '../../data/provinces'
import { dishToFlavorProfile } from '../../utils/flavorProfile'
import { shareDish } from '../../utils/share'
import FlavorRadar from './FlavorRadar'
import { cn } from '../../utils/cn'
import { renderDifficultyStars, getDifficultyAriaLabel } from '../../utils/difficulty'

const seasonLabels: Record<Exclude<Season, 'all'>, string> = {
  spring: '🌸 春季',
  summer: '☀️ 夏季',
  autumn: '🍂 秋季',
  winter: '❄️ 冬季',
}

interface DishDetailProps {
  dish: Dish
  isFavorite?: boolean
  isEaten?: boolean
  isWantToEat?: boolean
  onToggleFavorite?: () => void
  onToggleEaten?: () => void
  onToggleWantToEat?: () => void
  onClose?: () => void
}

const DishDetail = memo(function DishDetail({
  dish,
  isFavorite,
  isEaten,
  isWantToEat,
  onToggleFavorite,
  onToggleEaten,
  onToggleWantToEat,
  onClose,
}: DishDetailProps) {
  const flavors = useMemo(() => dishToFlavorProfile(dish), [dish])

  return (
    <div className="animate-slide-in-up bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden dark:bg-[var(--color-dark-surface)] dark:border-[var(--color-dark-border)]">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] dark:from-[var(--color-dark-primary)] dark:to-[var(--color-dark-accent)] p-5 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-white/20 flex items-center justify-center text-sm hover:bg-white/30 cursor-pointer"
          aria-label="关闭"
        >
          ✕
        </button>
        <div className="flex items-center gap-3">
          <span className="text-5xl" aria-hidden="true">{dish.emoji}</span>
          <div>
            <h2 id="dish-detail-title" className="text-xl font-bold">{dish.name}</h2>
            <span className="text-sm text-white/80">
              {categoryLabels[dish.category] || dish.category}
            </span>
          </div>
        </div>
        {dish.description && (
          <p className="mt-2 text-sm text-white/90">{dish.description}</p>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className={cn(
              'flex-1 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer',
              isFavorite
                ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-red-300 dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:border-[var(--color-dark-border)] dark:hover:border-red-700'
            )}
          >
            <span aria-hidden="true">{isFavorite ? '❤️' : '🤍'}</span> {isFavorite ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={onToggleWantToEat}
            aria-pressed={isWantToEat}
            className={cn(
              'flex-1 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer',
              isWantToEat
                ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-blue-300 dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:border-[var(--color-dark-border)] dark:hover:border-blue-700'
            )}
          >
            <span aria-hidden="true">{isWantToEat ? '💫' : '💭'}</span> 想吃
          </button>
          <button
            onClick={onToggleEaten}
            aria-pressed={isEaten}
            className={cn(
              'flex-1 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer',
              isEaten
                ? 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-green-300 dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:border-[var(--color-dark-border)] dark:hover:border-green-700'
            )}
          >
            <span aria-hidden="true">{isEaten ? '✅' : '⬜'}</span> 吃过
          </button>
          <button
            onClick={() => shareDish(dish).catch(() => {})}
            className="flex-1 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:border-[var(--color-dark-border)] dark:hover:border-[var(--color-dark-primary)]"
          >
            <span aria-hidden="true">📤</span> 分享
          </button>
        </div>

        {/* 口味雷达图 */}
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 dark:text-[var(--color-dark-text)]">口味分析</h3>
          <div className="flex justify-center">
            <FlavorRadar flavors={flavors} size={220} />
          </div>
        </div>

        {/* 主要食材 */}
        {dish.main_ingredients.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 dark:text-[var(--color-dark-text)]">主要食材</h3>
            <div className="flex flex-wrap gap-1.5">
              {dish.main_ingredients.map((ing) => (
                <span
                  key={ing}
                  className="text-sm bg-[var(--color-bg)] text-[var(--color-text-secondary)] px-2.5 py-1 rounded-full border border-[var(--color-border)] dark:bg-[var(--color-dark-border)] dark:text-[var(--color-dark-text-secondary)] dark:border-[var(--color-dark-border)]"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 烹饪方式 */}
        {dish.cooking_methods.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 dark:text-[var(--color-dark-text)]">烹饪方式</h3>
            <div className="flex flex-wrap gap-1.5">
              {dish.cooking_methods.map((m) => (
                <span
                  key={m}
                  className="text-sm bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2.5 py-1 rounded-full dark:bg-[var(--color-dark-accent)]/15 dark:text-[var(--color-dark-accent)]"
                >
                  {cookingMethodLabels[m] || m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 做法 */}
        {dish.recipe && (
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 dark:text-[var(--color-dark-text)]"><span aria-hidden="true">🍳</span> 做法</h3>
            <div className="recipe-block text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)] dark:bg-[var(--color-dark-border)]/30 dark:border-[var(--color-dark-border)]">
              {dish.recipe.split(/[。！？；]/).filter(Boolean).map((step, i) => (
                <div key={i} className="flex gap-2 mb-1.5 last:mb-0">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs flex items-center justify-center font-bold dark:bg-[var(--color-dark-primary)]/15 dark:text-[var(--color-dark-primary)]">
                    {i + 1}
                  </span>
                  <span>{step.trim()}。</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 烹饪难度 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">家庭烹饪难度</span>
          <span className="text-sm" aria-label={getDifficultyAriaLabel(dish.difficulty)}>{renderDifficultyStars(dish.difficulty)}</span>
          <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">({dish.difficulty}/5)</span>
        </div>

        {/* 最佳季节 */}
        {dish.best_season && dish.best_season !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">最佳季节</span>
            <span className="text-sm">
              {seasonLabels[dish.best_season as Exclude<Season, 'all'>] ?? dish.best_season}
            </span>
          </div>
        )}

        {/* 搭配推荐 */}
        {(dish.pairing_drink || dish.pairing_side || dish.pairing_staple) && (
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 dark:text-[var(--color-dark-text)]">搭配推荐</h3>
            <div className="space-y-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              {dish.pairing_drink && <p><span aria-hidden="true">🥤</span> 饮品：{dish.pairing_drink}</p>}
              {dish.pairing_side && <p><span aria-hidden="true">🥗</span> 小菜：{dish.pairing_side}</p>}
              {dish.pairing_staple && <p><span aria-hidden="true">🍚</span> 主食：{dish.pairing_staple}</p>}
            </div>
          </div>
        )}

        {/* 文化故事 */}
        {dish.story && (
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 dark:text-[var(--color-dark-text)]">文化故事</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed dark:text-[var(--color-dark-text-secondary)]">{dish.story}</p>
          </div>
        )}

        {/* 历史 */}
        {dish.history && (
          <div className="text-xs text-[var(--color-text-secondary)]/60 border-t border-[var(--color-border)] pt-3 dark:text-[var(--color-dark-text-secondary)]/60 dark:border-[var(--color-dark-border)]">
            <span aria-hidden="true">📜</span> {dish.history}
          </div>
        )}

        {/* 标签 */}
        {dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {dish.tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full dark:bg-[var(--color-dark-primary)]/15 dark:text-[var(--color-dark-primary)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default DishDetail
