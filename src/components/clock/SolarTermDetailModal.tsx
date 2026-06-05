import { memo, useCallback, useMemo } from 'react'
import type { Dish, SolarTerm } from '../../types'
import { cn } from '../../utils/cn'
import { useApp } from '../../context/AppContext'
import { useModalAccessibility } from '../../hooks/useModalAccessibility'
import DishCard from '../dish/DishCard'

interface SolarTermDetailModalProps {
  term: SolarTerm
  termDishes: Dish[]
  onClose: () => void
}

const seasonLabels: Record<string, { label: string; icon: string; color: string }> = {
  spring: { label: '春季', icon: '🌸', color: 'from-pink-400 to-green-400' },
  summer: { label: '夏季', icon: '☀️', color: 'from-yellow-400 to-orange-400' },
  autumn: { label: '秋季', icon: '🍂', color: 'from-orange-400 to-red-400' },
  winter: { label: '冬季', icon: '❄️', color: 'from-blue-400 to-purple-400' },
}

const healthTips: Record<string, string[]> = {
  spring: ['春季养肝为先，宜食绿色蔬菜', '适当食用辛温之品以助阳气升发', '注意防风保暖，饮食宜清淡温和'],
  summer: ['夏季养心为主，宜食苦味清热之品', '多补水，适量食用酸味食物收敛汗液', '饮食宜清淡，忌过食生冷损伤脾胃'],
  autumn: ['秋季养肺为要，宜食白色润燥之品', '适当食用酸味食物以收敛肺气', '注意滋阴润燥，多食梨、百合、银耳'],
  winter: ['冬季养肾为本，宜食黑色温补之品', '适当进补，但不宜过于燥热', '注意保暖御寒，饮食宜温热滋补'],
}

const SolarTermDetailModal = memo(function SolarTermDetailModal({
  term,
  termDishes,
  onClose,
}: SolarTermDetailModalProps) {
  const modalRef = useModalAccessibility(onClose)
  const { favoriteSet, eatenSet, toggleFavorite, toggleEaten } = useApp()

  const seasonInfo = useMemo(() => seasonLabels[term.season] || seasonLabels.spring, [term.season])
  const tips = useMemo(() => healthTips[term.season] || healthTips.spring, [term.season])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="solar-term-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[95vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-scale-in"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          className={cn(
            'bg-gradient-to-r p-5 text-white relative',
            seasonInfo.color
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-white/20 flex items-center justify-center text-sm hover:bg-white/30 cursor-pointer"
            aria-label="关闭"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{seasonInfo.icon}</span>
            <div>
              <h2 id="solar-term-title" className="text-xl font-bold">{term.name}</h2>
              {term.english_name && (
                <span className="text-sm text-white/80">{term.english_name}</span>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-white/90">{term.month}月{term.day}日</p>
        </div>

        <div className="p-5 space-y-5 bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)]">
          {/* 节气描述 */}
          {term.description && (
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-2">
                📖 节气介绍
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed">
                {term.description}
              </p>
            </div>
          )}

          {/* 饮食建议 */}
          {term.food_advice && (
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-2">
                🍽️ 饮食建议
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
                {term.food_advice}
              </p>
            </div>
          )}

          {/* 养生小贴士 */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-2">
              💡 {seasonInfo.label}养生小贴士
            </h3>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] flex items-start gap-2"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs flex items-center justify-center font-bold dark:bg-[var(--color-dark-primary)]/15 dark:text-[var(--color-dark-primary)] mt-0.5">
                    {i + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 推荐菜品 */}
          {termDishes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
                🍳 {term.name}推荐菜品
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {termDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    isFavorite={favoriteSet.has(dish.id)}
                    isEaten={eatenSet.has(dish.id)}
                    onToggleFavorite={() => toggleFavorite(dish.id)}
                    onToggleEaten={() => toggleEaten(dish.id)}
                    onClick={() => {
                      // 关闭当前弹窗，打开菜品详情
                      onClose()
                      // 使用微任务延迟打开新弹窗，避免状态冲突
                      setTimeout(() => {
                        const event = new CustomEvent('open-dish-detail', { detail: dish })
                        window.dispatchEvent(event)
                      }, 100)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {termDishes.length === 0 && (
            <div className="text-center py-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              暂无该节气的推荐菜品
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default SolarTermDetailModal
