import { geoMercator } from 'd3-geo'
import type { GeoProjection } from 'd3-geo'

const provinceAdcodes: Record<string, number> = {
  beijing: 110000, tianjin: 120000, hebei: 130000, shanxi: 140000,
  neimenggu: 150000, liaoning: 210000, jilin: 220000, heilongjiang: 230000,
  shanghai: 310000, jiangsu: 320000, zhejiang: 330000, anhui: 340000,
  fujian: 350000, jiangxi: 360000, shandong: 370000, henan: 410000,
  hubei: 420000, hunan: 430000, guangdong: 440000, guangxi: 450000,
  hainan: 460000, chongqing: 500000, sichuan: 510000, guizhou: 520000,
  yunnan: 530000, xizang: 540000, shaanxi: 610000, gansu: 620000,
  qinghai: 630000, ningxia: 640000, xinjiang: 650000, hongkong: 810000,
  macau: 820000, taiwan: 710000,
}

export const idToAdcode = { ...provinceAdcodes }

export interface ProvincePath {
  id: string
  name: string
  d: string
}

interface GeoJSONFeature {
  geometry: { type: string; coordinates: unknown }
  properties?: { name?: string; adcode?: string }
}

interface GeoJSONFeatureCollection {
  features?: GeoJSONFeature[]
}

/**
 * 从 public/data/provincePaths.json 加载省份 SVG 路径数据
 */
function isProvincePath(value: unknown): value is ProvincePath {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.d === 'string'
}

export async function loadChinaMapPaths(): Promise<ProvincePath[]> {
  const res = await fetch('/data/provincePaths.json')
  if (!res.ok) {
    throw new Error(`Failed to load province paths: ${res.status} ${res.statusText}`)
  }
  try {
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.filter(isProvincePath)
  } catch (err) {
    throw new Error(`Failed to parse province paths JSON: ${err instanceof Error ? err.message : String(err)}`, { cause: err })
  }
}

/**
 * 获取指定省份的县级地图路径
 * 县级数据运行时从 DataV CDN 加载
 */
export async function loadProvinceCountyPaths(
  provinceId: string
): Promise<ProvincePath[] | null> {
  const adcode = provinceAdcodes[provinceId]
  if (!adcode) return null

  const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`
  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    throw new Error(`Network error loading county data for ${provinceId}: ${err instanceof Error ? err.message : String(err)}`, { cause: err })
  }
  if (!res.ok) {
    throw new Error(`Failed to load county data for ${provinceId}: ${res.status} ${res.statusText}`)
  }
  let geojson: GeoJSONFeatureCollection
  try {
    geojson = await res.json()
  } catch (err) {
    throw new Error(`Failed to parse county data JSON for ${provinceId}: ${err instanceof Error ? err.message : String(err)}`, { cause: err })
  }

  // 手动投影：以中国为中心
  const projection: GeoProjection = geoMercator()
    .center([104, 37])
    .scale(600)
    .translate([480, 300])

  const paths: ProvincePath[] = []
  const features = geojson.features || []

  for (const feature of features) {
    if (!feature.geometry) continue
    const countyAdcode = feature.properties?.adcode
    if (!countyAdcode) continue
    const name: string = feature.properties?.name || ''
    const d = featureToPath(feature, projection)
    if (d) {
      paths.push({ id: `county_${countyAdcode}`, name, d })
    }
  }

  return paths
}

/**
 * 手动将 GeoJSON feature 转换为 SVG path d 属性
 * 绕过 d3-geo pathGenerator 的 bounds 问题
 */
function featureToPath(
  feature: { geometry: { type: string; coordinates: unknown } },
  projection: GeoProjection
): string {
  const { type, coordinates } = feature.geometry
  const parts: string[] = []

  if (type === 'Polygon' && Array.isArray(coordinates)) {
    for (const ring of coordinates as number[][][]) {
      if (Array.isArray(ring)) {
        parts.push(ringToPath(ring, projection))
      }
    }
  } else if (type === 'MultiPolygon' && Array.isArray(coordinates)) {
    for (const polygon of coordinates as number[][][][]) {
      if (Array.isArray(polygon)) {
        for (const ring of polygon) {
          if (Array.isArray(ring)) {
            parts.push(ringToPath(ring, projection))
          }
        }
      }
    }
  }

  return parts.join(' ')
}

function ringToPath(ring: number[][], projection: GeoProjection): string {
  const pathParts = ring
    .map((coord, i) => {
      const projected = projection(coord as [number, number])
      if (!projected || isNaN(projected[0]) || isNaN(projected[1])) return ''
      const [x, y] = projected
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .filter(Boolean)
  return pathParts.length > 0 ? pathParts.join(' ') + ' Z' : ''
}
