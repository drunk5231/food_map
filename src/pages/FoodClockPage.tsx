import { useDishCache } from '../hooks/useDishCache'
import FoodClock from '../components/clock/FoodClock'
import { PageLoading, PageError } from '../components/ui/PageLoading'

export default function FoodClockPage() {
  const { dishes, loading, error, retry } = useDishCache()

  if (loading) return <PageLoading icon="🕐" />
  if (error) return <PageError error={error} onRetry={retry} />

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <FoodClock allDishes={dishes} />
    </div>
  )
}
