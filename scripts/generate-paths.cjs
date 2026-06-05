/**
 * 生成省份 SVG 路径数据
 * 运行方式: node scripts/generate-paths.js
 */
const { geoMercator } = require('d3-geo');
const fs = require('fs');
const path = require('path');

const adcodeToId = {
  110000:'beijing', 120000:'tianjin', 130000:'hebei', 140000:'shanxi',
  150000:'neimenggu', 210000:'liaoning', 220000:'jilin', 230000:'heilongjiang',
  310000:'shanghai', 320000:'jiangsu', 330000:'zhejiang', 340000:'anhui',
  350000:'fujian', 360000:'jiangxi', 370000:'shandong', 410000:'henan',
  420000:'hubei', 430000:'hunan', 440000:'guangdong', 450000:'guangxi',
  460000:'hainan', 500000:'chongqing', 510000:'sichuan', 520000:'guizhou',
  530000:'yunnan', 540000:'xizang', 610000:'shaanxi', 620000:'gansu',
  630000:'qinghai', 640000:'ningxia', 650000:'xinjiang', 810000:'hongkong',
  820000:'macau', 710000:'taiwan'
};

function ringToPath(ring, proj) {
  return ring.map((c, i) => {
    const p = proj(c);
    return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
  }).join(' ') + ' Z';
}

function featureToPath(f, proj) {
  const g = f.geometry;
  const parts = [];
  if (g.type === 'Polygon') {
    for (const r of g.coordinates) parts.push(ringToPath(r, proj));
  } else if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates) {
      for (const r of poly) parts.push(ringToPath(r, proj));
    }
  }
  return parts.join(' ');
}

async function main() {
  console.log('Fetching GeoJSON...');
  const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
  const geojson = await res.json();

  // 只保留省级行政区
  const features = geojson.features.filter(f => adcodeToId[f.properties?.adcode]);
  console.log(`Found ${features.length} provinces`);

  // 手动投影：以中国为中心
  const proj = geoMercator()
    .center([104, 37])
    .scale(600)
    .translate([480, 300]);

  // 生成 TypeScript 文件
  let ts = `/** Auto-generated province SVG paths. Do not edit manually. */\n`;
  ts += `import type { ProvincePath } from './geoLoader'\n\n`;
  ts += `export const provincePaths: ProvincePath[] = [\n`;

  for (const f of features) {
    const adcode = f.properties?.adcode;
    const id = adcodeToId[adcode];
    const name = f.properties?.name || '';
    const d = featureToPath(f, proj);
    ts += `  { id: "${id}", name: "${name}", d: "${d}" },\n`;
  }

  ts += `]\n`;

  const outPath = path.join(__dirname, '..', 'src', 'data', 'map', 'provincePaths.ts');
  fs.writeFileSync(outPath, ts);
  console.log(`Generated ${outPath}`);

  // 验证坐标范围
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const f of features) {
    const d = featureToPath(f, proj);
    const nums = d.match(/-?\d+\.?\d*/g)?.map(Number) || [];
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    minX = Math.min(minX, ...xs); maxX = Math.max(maxX, ...xs);
    minY = Math.min(minY, ...ys); maxY = Math.max(maxY, ...ys);
  }
  console.log(`Coordinate range: X=${minX.toFixed(0)}-${maxX.toFixed(0)} Y=${minY.toFixed(0)}-${maxY.toFixed(0)}`);
  console.log(`Usage: ${((maxX-minX)/960*100).toFixed(1)}% x ${((maxY-minY)/600*100).toFixed(1)}%`);
}

main().catch(console.error);
