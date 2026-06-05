interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export default function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-11 h-11 rounded-lg bg-white/90 dark:bg-[var(--color-dark-surface)]/90 border border-[var(--color-border)] dark:border-[var(--color-dark-border)] text-xl flex items-center justify-center hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-surface)] cursor-pointer active:bg-[var(--color-bg)] dark:active:bg-[var(--color-dark-surface)]"
        aria-label="放大"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-11 h-11 rounded-lg bg-white/90 dark:bg-[var(--color-dark-surface)]/90 border border-[var(--color-border)] dark:border-[var(--color-dark-border)] text-xl flex items-center justify-center hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-surface)] cursor-pointer active:bg-[var(--color-bg)] dark:active:bg-[var(--color-dark-surface)]"
        aria-label="缩小"
      >
        −
      </button>
      <button
        onClick={onReset}
        className="w-11 h-11 rounded-lg bg-white/90 dark:bg-[var(--color-dark-surface)]/90 border border-[var(--color-border)] dark:border-[var(--color-dark-border)] text-base flex items-center justify-center hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-surface)] cursor-pointer active:bg-[var(--color-bg)] dark:active:bg-[var(--color-dark-surface)]"
        aria-label="重置视图"
      >
        ↺
      </button>
    </div>
  )
}
