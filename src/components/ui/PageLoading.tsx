export function PageLoading({ icon = '⏳' }: { icon?: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-3 clock-pulse">{icon}</div>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">加载中...</p>
      </div>
    </div>
  )
}

export function PageError({ error, icon = '😵', onRetry }: { error: string; icon?: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-2">数据加载失败</p>
        <p className="text-xs text-[var(--color-text-secondary)]/60 dark:text-[var(--color-dark-text-secondary)]/60 mb-3">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:bg-[var(--color-primary-hover)] dark:hover:bg-[var(--color-dark-primary-hover)] cursor-pointer transition-colors"
          >
            重试
          </button>
        )}
      </div>
    </div>
  )
}
