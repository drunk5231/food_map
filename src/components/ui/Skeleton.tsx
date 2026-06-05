export function SkeletonCard() {
  return (
    <div aria-hidden="true" className="animate-pulse bg-white rounded-2xl p-4 space-y-3 dark:bg-[var(--color-dark-surface)]">
      <div className="h-8 w-8 bg-gray-200 rounded dark:bg-gray-700" />
      <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700" />
      <div className="h-3 bg-gray-200 rounded w-full dark:bg-gray-700" />
      <div className="h-3 bg-gray-200 rounded w-5/6 dark:bg-gray-700" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded-full dark:bg-gray-700" />
        <div className="h-6 w-16 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
