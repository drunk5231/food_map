import { geoMercator, geoPath } from 'd3-geo'
import { writeFileSync } from 'fs'

const CHINA_GEO_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'

const provinceAdcodes = {
  beijing: 110000,
  tianjin: 120000,
  hebei: 130000,
  shanxi: 140000,
  neimenggu: 150000,
  liaoning: 210000,
  jilin: 220000,
  heilongjiang: 230000,
  shanghai: 310000,
  jiangsu: 320000,
  zhejiang: 330000,
  anhui: 340000,
  fujian: 350000,
  jiangxi: 360000,
  shandong: 370000,
  henan: 410000,
  hubei: 420000,
  hunan: 430000,
  guangdong: 440000,
  guangxi: 450000,
  hainan: 460000,
  chongqing: 500000,
  sichuan: 510000,
  guizhou: 520000,
  yunnan: 530000,
  xizang: 540000,
  shaanxi: 610000,
  gansu: 620000,
  qinghai: 630000,
  ningxia: 640000,
  xinjiang: 650000,
  hongkong: 810000,
  macau: 820000,
  taiwan: 710000,
}

const adcodeToId = Object.fromEntries(
  Object.entries(provinceAdcodes).map(([id, code]) => [code, id])
)

async function main() {
  console.log('Fetching GeoJSON...')
  const res = await fetch(CHINA_GEO_URL)
  if (!res.ok) {
    console.error('Failed to fetch:', res.status)
    process.exit(1)
  }
  const geojson = await res.json()
  console.log('GeoJSON fetched, features:', geojson.features.length)

  const projection = geoMercator().fitSize([960, 600], geojson)
  const pathGenerator = geoPath(projection)

  const entries = []
  for (const feature of geojson.features) {
    const adcode = feature.properties?.adcode
    const name = feature.properties?.name || ''
    const id = adcodeToId[adcode]
    if (!id) {
      console.warn('Unknown adcode:', adcode, name)
      continue
    }
    const d = pathGenerator(feature) || ''
    if (!d) {
      console.warn('Empty path for:', id, name)
    }
    entries.push({ id, name, d })
  }

  console.log('Generated', entries.length, 'province paths')

  // Validate paths are within bounds
  for (const entry of entries) {
    if (entry.d) {
      const nums = entry.d.match(/-?\d+\.?\d*/g)?.map(Number) || []
      const xs = nums.filter((_, i) => i % 2 === 0)
      const ys = nums.filter((_, i) => i % 2 === 1)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      console.log(`${entry.id}: x=[${minX.toFixed(0)}, ${maxX.toFixed(0)}] y=[${minY.toFixed(0)}, ${maxY.toFixed(0)}]`)
    }
  }

  // Generate TypeScript file
  const lines = entries.map((e) => {
    // Truncate d to save space - keep full precision
    return `  { id: ${JSON.stringify(e.id)}, name: ${JSON.stringify(e.name)}, d: ${JSON.stringify(e.d)} }`
  })

  const tsContent = `/** Auto-generated province SVG paths from GeoJSON. Do not edit manually. */
import type { ProvincePath } from './geoLoader'

export const provincePaths: ProvincePath[] = [
${lines.join(',\n')}
]
`

  writeFileSync('src/data/map/provincePaths.ts', tsContent, 'utf-8')
  console.log('Written to src/data/map/provincePaths.ts')
}

main().catch(console.error)
