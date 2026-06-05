import { provinceMeta } from '../../data/provinces'

const REGIONS = ['华北', '东北', '华东', '华中', '华南', '西南', '西北'] as const

export default function MapLegend() {
  return (
    <div className="absolute top-3 left-3 z-10 hidden lg:flex flex-col gap-1 bg-white/80 dark:bg-[var(--color-dark-surface)]/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs border border-[var(--color-border)]/50 dark:border-[var(--color-dark-border)]/50">
      {REGIONS.map((region) => {
        const sample = provinceMeta.find((p) => p.region === region)
        return (
          <div key={region} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: sample?.color }} />
            <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">{region}</span>
          </div>
        )
      })}
    </div>
  )
}
