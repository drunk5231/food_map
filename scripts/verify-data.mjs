import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env
const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const { data, error } = await supabase.from('dishes').select('province_id, name, emoji')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\n✅ Total: ${data.length} dishes\n`)

const provinces = {}
for (const d of data) {
  provinces[d.province_id] = provinces[d.province_id] || []
  provinces[d.province_id].push(`${d.emoji} ${d.name}`)
}

for (const p of Object.keys(provinces).sort()) {
  console.log(`${p} (${provinces[p].length}): ${provinces[p].join(', ')}`)
}
