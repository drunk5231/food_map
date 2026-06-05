import { useDishCache } from '../hooks/useDishCache'
import TasteTest from '../components/taste/TasteTest'
import { PageLoading, PageError } from '../components/ui/PageLoading'

export default function TasteTestPage() {
  const { dishes, loading, error, retry } = useDishCache()

  if (loading) return <PageLoading icon="🧬" />
  if (error) return <PageError error={error} onRetry={retry} />

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <TasteTest allDishes={dishes} />
    </div>
  )
}
