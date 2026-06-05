import { memo, useMemo, useCallback } from 'react'
import type { FlavorProfile } from '../../types'
import { FLAVOR_KEYS } from '../../utils/flavorProfile'
import { flavorLabels, flavorColors } from '../../data/provinces'

interface FlavorRadarProps {
  flavors: FlavorProfile
  size?: number
  showLabels?: boolean
  compareWith?: FlavorProfile
}

// 预计算每个维度的基础角度（只算一次）
const BASE_ANGLES = FLAVOR_KEYS.map((_, i) => ((Math.PI * 2) / FLAVOR_KEYS.length) * i - Math.PI / 2)

const FlavorRadar = memo(function FlavorRadar({
  flavors,
  size = 200,
  showLabels = true,
  compareWith,
}: FlavorRadarProps) {
  const center = size / 2
  const radius = size / 2 - 30

  // 预计算网格圆环的多边形点（只依赖 size）
  const gridPolygons = useMemo(() => {
    return [2, 4, 6, 8, 10].map((level) => {
      const r = (level / 10) * radius
      return BASE_ANGLES.map(
        (angle) => `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
      ).join(' ')
    })
  }, [center, radius])

  // 预计算轴线端点（只依赖 size）
  const axisEndpoints = useMemo(() => {
    return BASE_ANGLES.map((angle) => ({
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }))
  }, [center, radius])

  // 预计算标签位置（只依赖 size）
  const labelPositions = useMemo(() => {
    const labelR = radius + 18
    return BASE_ANGLES.map((angle) => ({
      x: center + labelR * Math.cos(angle),
      y: center + labelR * Math.sin(angle),
    }))
  }, [center, radius])

  // 生成多边形路径
  const makePolygonPath = useCallback(
    (profile: FlavorProfile) => {
      return FLAVOR_KEYS.map((key, i) => {
        const r = ((profile[key] || 0) / 10) * radius
        const x = center + r * Math.cos(BASE_ANGLES[i])
        const y = center + r * Math.sin(BASE_ANGLES[i])
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ') + ' Z'
    },
    [center, radius]
  )

  const mainPath = useMemo(() => makePolygonPath(flavors), [flavors, makePolygonPath])
  const comparePath = useMemo(
    () => (compareWith ? makePolygonPath(compareWith) : null),
    [compareWith, makePolygonPath]
  )

  // 数据点坐标
  const dataPoints = useMemo(() => {
    return FLAVOR_KEYS.map((key, i) => {
      const r = ((flavors[key] || 0) / 10) * radius
      return {
        x: center + r * Math.cos(BASE_ANGLES[i]),
        y: center + r * Math.sin(BASE_ANGLES[i]),
      }
    })
  }, [flavors, center, radius])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="口味雷达图">
      {/* 网格圆环 */}
      {gridPolygons.map((points, i) => (
        <polygon key={i} className="radar-grid" points={points} />
      ))}

      {/* 轴线 */}
      {axisEndpoints.map((ep, i) => (
        <line
          key={FLAVOR_KEYS[i]}
          x1={center}
          y1={center}
          x2={ep.x}
          y2={ep.y}
          stroke="var(--svg-border)"
          strokeWidth={0.5}
        />
      ))}

      {/* 对比数据（如果有） */}
      {comparePath && (
        <path
          d={comparePath}
          fill="rgba(82, 196, 26, 0.1)"
          stroke="var(--color-accent)"
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />
      )}

      {/* 主数据区域 */}
      <path
        d={mainPath}
        className="radar-area"
      />

      {/* 数据点 */}
      {dataPoints.map((pt, i) => (
        <circle
          key={FLAVOR_KEYS[i]}
          cx={pt.x}
          cy={pt.y}
          r={3}
          className="radar-dot"
        />
      ))}

      {/* 标签 */}
      {showLabels &&
        FLAVOR_KEYS.map((key, i) => (
          <text
            key={key}
            x={labelPositions[i].x}
            y={labelPositions[i].y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill={flavorColors[key] || 'var(--svg-text-secondary)'}
            fontWeight={600}
          >
            {flavorLabels[key]}
            <tspan fontSize={9} fill="var(--svg-text-secondary)" dx={2}>
              {flavors[key]?.toFixed(0) || 0}
            </tspan>
          </text>
        ))}
    </svg>
  )
})

export default FlavorRadar
