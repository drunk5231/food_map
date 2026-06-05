import type { Dish } from '../../types'
import { useApp } from '../../context/AppContext'
import { useModalAccessibility } from '../../hooks/useModalAccessibility'
import DishDetail from './DishDetail'

interface DishDetailModalProps {
  dish: Dish
  onClose: () => void
}

export default function DishDetailModal({ dish, onClose }: DishDetailModalProps) {
  const { favoriteSet, eatenSet, wantToEatSet, toggleFavorite, toggleEaten, toggleWantToEat } = useApp()
  const modalRef = useModalAccessibility(onClose)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-detail-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[95vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-scale-in"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <DishDetail
          dish={dish}
          isFavorite={favoriteSet.has(dish.id)}
          isEaten={eatenSet.has(dish.id)}
          isWantToEat={wantToEatSet.has(dish.id)}
          onToggleFavorite={() => toggleFavorite(dish.id)}
          onToggleEaten={() => toggleEaten(dish.id)}
          onToggleWantToEat={() => toggleWantToEat(dish.id)}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
