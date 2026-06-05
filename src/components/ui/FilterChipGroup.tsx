import { cn } from '../../utils/cn'

interface FilterChipGroupProps<T extends string> {
  options: { value: T; label: string }[]
  selected: T
  onSelect: (v: T) => void
}

export default function FilterChipGroup<T extends string>({
  options,
  selected,
  onSelect,
}: FilterChipGroupProps<T>) {
  return (
    <div className="flex gap-1.5 flex-wrap" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          aria-pressed={selected === opt.value}
          className={cn(
            'px-3 py-1.5 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer',
            selected === opt.value
              ? 'bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white'
              : 'bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-primary)] dark:hover:border-[var(--color-dark-primary)]'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
