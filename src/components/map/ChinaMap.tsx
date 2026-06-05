import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadChinaMapPaths, type ProvincePath as ProvincePathData } from '../../data/map/geoLoader'
import { provinceMeta } from '../../data/provinces'
import { useDishCache } from '../../hooks/useDishCache'
import { useMapInteraction } from '../../hooks/useMapInteraction'
import { cn } from '../../utils/cn'
import MapControls from './MapControls'
import MapLegend from './MapLegend'

const MAP_VIEWBOX = { width: 960, height: 600 } as const

// ─── Province name label positions (centroid approximations in viewBox 0 0 960 600) ───
const LABEL_POSITIONS: Record<string, { x: number; y: number; label?: string }> = {
  beijing:      { x: 610, y: 256 },
  tianjin:      { x: 625, y: 270 },
  hebei:        { x: 600, y: 285 },
  shanxi:       { x: 569, y: 290 },
  neimenggu:    { x: 580, y: 175 },
  liaoning:     { x: 672, y: 247 },
  jilin:        { x: 716, y: 209 },
  heilongjiang: { x: 722, y: 145 },
  shanghai:     { x: 668, y: 373 },
  jiangsu:      { x: 640, y: 348 },
  zhejiang:     { x: 658, y: 395 },
  anhui:        { x: 618, y: 360 },
  fujian:       { x: 635, y: 435 },
  jiangxi:      { x: 603, y: 418 },
  shandong:     { x: 638, y: 305 },
  henan:        { x: 582, y: 338 },
  hubei:        { x: 563, y: 375 },
  hunan:        { x: 558, y: 420 },
  guangdong:    { x: 578, y: 472 },
  guangxi:      { x: 525, y: 458 },
  hainan:       { x: 555, y: 530 },
  sichuan:      { x: 468, y: 385 },
  chongqing:    { x: 518, y: 389 },
  guizhou:      { x: 511, y: 428 },
  yunnan:       { x: 452, y: 455 },
  xizang:       { x: 322, y: 365 },
  shaanxi:      { x: 535, y: 320 },
  gansu:        { x: 465, y: 295 },
  qinghai:      { x: 400, y: 320 },
  ningxia:      { x: 503, y: 295 },
  xinjiang:     { x: 266, y: 240 },
  hongkong:     { x: 590, y: 480, label: '港' },
  macau:        { x: 578, y: 482, label: '澳' },
  taiwan:       { x: 662, y: 458 },
}

// ─── Province shape with memo ───
const ProvinceShape = memo(function ProvinceShape({
  pathData,
  meta,
  isHovered,
  dishCount,
}: {
  pathData: ProvincePathData
  meta: (typeof provinceMeta)[number] | undefined
  isHovered: boolean
  dishCount: number
}) {
  if (!meta) return null
  if (!pathData.d) return null

  const label = dishCount > 0
    ? `${meta.name}，收录${dishCount}道美食，点击查看详情`
    : `${meta.name}，点击查看详情`

  return (
    <path
      d={pathData.d}
      className={cn('province-path', isHovered && 'active')}
      fill={meta.color}
      opacity={isHovered ? 1 : 0.88}
      data-province-id={pathData.id}
      role="button"
      tabIndex={0}
      aria-label={label}
    />
  )
})

// ─── Main component ───
export default function ChinaMap() {
  const [paths, setPaths] = useState<ProvincePathData[]>([])
  const [pathsLoading, setPathsLoading] = useState(true)
  const [pathsError, setPathsError] = useState<string | null>(null)
  const hoveredIdRef = useRef<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { dishes } = useDishCache()

  useEffect(() => {
    let cancelled = false
    loadChinaMapPaths().then((data) => {
      if (!cancelled) {
        setPaths(data)
        setPathsLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setPathsError('地图数据加载失败')
        setPathsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const navigate = useNavigate()
  const { transform, isDragging, handlers, wasDrag, zoomIn, zoomOut, resetTransform } =
    useMapInteraction(1, containerRef)

  const metaMap = useMemo(
    () => Object.fromEntries(provinceMeta.map((m) => [m.id, m])),
    []
  )

  // Pre-compute dish count per province for tooltip
  const dishCountByProvince = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of dishes) {
      counts[d.province_id] = (counts[d.province_id] || 0) + 1
    }
    return counts
  }, [dishes])

  const hoveredMeta = hoveredId ? metaMap[hoveredId] : null

  // Tooltip positioning via ref (no re-render on mouse move)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handlers.onMouseMove(e)
      if (tooltipRef.current) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left + 14
        const y = e.clientY - rect.top - 10
        tooltipRef.current.style.left = `${x}px`
        tooltipRef.current.style.top = `${y}px`
      }
    },
    [handlers]
  )

  const getProvinceIdFromTarget = useCallback(
    (target: EventTarget | null): string | null => {
      if (!(target instanceof Element)) return null
      return target.closest('[data-province-id]')?.getAttribute('data-province-id') ?? null
    },
    []
  )

  const handleGroupMouseOver = useCallback(
    (e: React.MouseEvent) => {
      const id = getProvinceIdFromTarget(e.target)
      if (id !== hoveredIdRef.current) {
        hoveredIdRef.current = id
        setHoveredId(id)
      }
    },
    [getProvinceIdFromTarget]
  )

  const handleGroupMouseOut = useCallback(
    (e: React.MouseEvent) => {
      const id = getProvinceIdFromTarget(e.target)
      const relatedId = getProvinceIdFromTarget(e.relatedTarget)
      if (id && id !== relatedId) {
        hoveredIdRef.current = null
        setHoveredId(null)
      }
    },
    [getProvinceIdFromTarget]
  )

  const handleGroupClick = useCallback(
    (e: React.MouseEvent) => {
      if (wasDrag()) return
      const id = getProvinceIdFromTarget(e.target)
      if (id && metaMap[id]) {
        navigate(`/province/${id}`)
      }
    },
    [wasDrag, getProvinceIdFromTarget, metaMap, navigate]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const id = getProvinceIdFromTarget(e.target)
        if (id && metaMap[id]) {
          navigate(`/province/${id}`)
        }
      }
    },
    [getProvinceIdFromTarget, metaMap, navigate]
  )

  // ResizeObserver removed: tooltip now uses ref-based positioning (no state needed)

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl bg-[var(--color-map-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
      {/* 缩放控制 */}
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetTransform} />

      {/* 区域图例 */}
      <MapLegend />

      {/* 提示 */}
      <div className="absolute bottom-3 left-3 z-10 text-xs text-[var(--color-text-secondary)]/60 dark:text-[var(--color-dark-text-secondary)]/60 bg-white/70 dark:bg-[var(--color-dark-surface)]/70 px-2 py-1 rounded hidden sm:block">
        滚轮缩放 · 拖拽平移 · 点击查看详情
      </div>
      <div className="absolute bottom-3 left-3 z-10 text-xs text-[var(--color-text-secondary)]/60 dark:text-[var(--color-dark-text-secondary)]/60 bg-white/70 dark:bg-[var(--color-dark-surface)]/70 px-2 py-1 rounded sm:hidden">
        双指缩放 · 拖拽平移 · 点击查看详情
      </div>

      {/* SVG 地图 */}
      {pathsError ? (
        <div className="w-full h-[65vh] flex items-center justify-center bg-[var(--color-map-bg)] dark:bg-[var(--color-dark-surface)]">
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm text-red-600 dark:text-red-400">{pathsError}</span>
          </div>
        </div>
      ) : pathsLoading ? (
        <div className="w-full h-[65vh] flex items-center justify-center bg-[var(--color-map-bg)] dark:bg-[var(--color-dark-surface)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-[var(--color-border)] dark:border-[var(--color-dark-border)] border-t-[var(--color-text-secondary)] dark:border-t-[var(--color-dark-text-secondary)] rounded-full animate-spin" />
            <span className="text-sm text-[var(--color-text-secondary)]/70 dark:text-[var(--color-dark-text-secondary)]/70">地图加载中...</span>
          </div>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          className={cn(
            'w-full h-[65vh] select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{ touchAction: 'none', backgroundColor: 'var(--svg-bg)' }}
          aria-label="中国美食地图，点击省份查看详情"
          {...handlers}
          onMouseMove={handleMouseMove}
        >
          <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="var(--svg-bg)" />
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
            onMouseOver={handleGroupMouseOver}
            onMouseOut={handleGroupMouseOut}
            onClick={handleGroupClick}
            onKeyDown={handleKeyDown}
          >
            {/* Province shapes */}
            {paths.map((p) => (
              <ProvinceShape
                key={p.id}
                pathData={p}
                meta={metaMap[p.id]}
                isHovered={hoveredId === p.id}
                dishCount={dishCountByProvince[p.id] || 0}
              />
            ))}

            {/* Province name labels */}
            {paths.map((p) => {
              const pos = LABEL_POSITIONS[p.id]
              if (!pos) return null
              const meta = metaMap[p.id]
              if (!meta) return null
              // Hide label when zoomed out too far or when province is hovered
              if (hoveredId === p.id) return null
              return (
                <text
                  key={`label-${p.id}`}
                  x={pos.x}
                  y={pos.y}
                  className="province-label"
                  style={{
                    fontSize: p.id === 'hongkong' || p.id === 'macau' ? '8px' : undefined,
                  }}
                >
                  {pos.label || meta.name.replace(/[省市区回族维吾尔壮族自治特别行政]/g, '').slice(0, 2)}
                </text>
              )
            })}
          </g>
        </svg>
      )}

      {/* Tooltip (positioned via ref for performance) */}
      {hoveredMeta && !isDragging && (
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none z-20 bg-[var(--color-text)]/95 dark:bg-[var(--color-dark-surface)] dark:border dark:border-[var(--color-dark-border)] text-white px-4 py-3 rounded-xl text-sm animate-fade-in shadow-lg backdrop-blur-sm max-w-[220px]"
          style={{ left: 0, top: 0 }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: hoveredMeta.color }} />
            <span className="font-bold text-base">{hoveredMeta.name}</span>
          </div>
          <div className="text-xs text-white/80 mb-1">
            {hoveredMeta.cuisine_family} · {hoveredMeta.region}
          </div>
          {dishCountByProvince[hoveredId!] > 0 && (
            <div className="text-xs text-white/60">
              收录 {dishCountByProvince[hoveredId!]} 道美食
            </div>
          )}
          <div className="text-[10px] text-white/50 mt-1.5 border-t border-white/10 pt-1.5">
            点击查看详情 →
          </div>
        </div>
      )}
    </div>
  )
}
