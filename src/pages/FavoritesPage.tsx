import { useState, useMemo, useCallback, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { useDishCache } from '../hooks/useDishCache'
import DishList from '../components/dish/DishList'
import FlavorRadar from '../components/dish/FlavorRadar'
import { useApp } from '../context/AppContext'
import { provinceMeta, categoryLabels, flavorLabels } from '../data/provinces'
import { FLAVOR_KEYS } from '../utils/flavorProfile'
import { describeTasteProfile, getMatchedCuisines } from '../utils/flavorMatch'
import { useFavoritesStats } from '../hooks/useFavoritesStats'
import { shareFavoritesStats } from '../utils/share'
import type { FlavorProfile, Dish, DishCategory } from '../types'
import { cn } from '../utils/cn'
import { downloadUserData, importUserData } from '../utils/dataPort'
import { useToast } from '../components/ui/Toast'

type Tab = 'favorites' | 'eaten' | 'want' | 'stats'
type SortKey = 'default' | 'province' | 'spicy' | 'difficulty'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '默认' },
  { key: 'province', label: '省份' },
  { key: 'spicy', label: '辣度' },
  { key: 'difficulty', label: '难度' },
]

function sortDishes(dishes: Dish[], sortKey: SortKey): Dish[] {
  if (sortKey === 'default') return dishes
  const sorted = [...dishes]
  switch (sortKey) {
    case 'province':
      sorted.sort((a, b) => a.province_id.localeCompare(b.province_id))
      break
    case 'spicy':
      sorted.sort((a, b) => b.spicy - a.spicy)
      break
    case 'difficulty':
      sorted.sort((a, b) => b.difficulty - a.difficulty)
      break
  }
  return sorted
}

// ==================== 口味 DNA 描述卡片 ====================

const TasteDNACard = memo(function TasteDNACard({
  avgFlavors,
}: {
  avgFlavors: Record<keyof FlavorProfile, number>
}) {
  const dnaDesc = useMemo(() => describeTasteProfile(avgFlavors), [avgFlavors])
  const matchedCuisines = useMemo(() => getMatchedCuisines(avgFlavors), [avgFlavors])

  // 找出最高口味维度
  const topDimensions = useMemo(() => {
    return FLAVOR_KEYS
      .map((k) => ({ key: k, value: avgFlavors[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .filter((d) => d.value > 0)
  }, [avgFlavors])

  const dimensionColorClasses: Record<keyof FlavorProfile, string> = {
    spicy: 'text-red-500 dark:text-red-400',
    sweet: 'text-orange-500 dark:text-orange-400',
    sour: 'text-yellow-500 dark:text-yellow-400',
    salty: 'text-blue-500 dark:text-blue-400',
    umami: 'text-green-500 dark:text-green-400',
    numbing: 'text-purple-500 dark:text-purple-400',
    bitter: 'text-teal-500 dark:text-teal-400',
    aromatic: 'text-pink-500 dark:text-pink-400',
  }

  return (
    <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] p-5">
      <h3 className="text-base font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-4">
        🧬 口味 DNA 描述
      </h3>

      {/* DNA 标签 */}
      <div className="flex items-center justify-center mb-4">
        <span className="inline-block px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-full text-lg font-bold text-[var(--color-primary)] dark:text-[var(--color-dark-primary)]">
          {dnaDesc}
        </span>
      </div>

      {/* 突出维度 */}
      {topDimensions.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            突出维度：
          </span>
          {topDimensions.map((d) => (
            <span
              key={d.key}
              className={cn('text-sm font-bold', dimensionColorClasses[d.key])}
            >
              {flavorLabels[d.key]} {d.value.toFixed(1)}
            </span>
          ))}
        </div>
      )}

      {/* 最匹配菜系 */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-2">
          最匹配的菜系推荐：
        </p>
        <div className="flex flex-wrap gap-2">
          {matchedCuisines.map((c) => (
            <span
              key={c.name}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)] rounded-lg text-sm text-[var(--color-text)] dark:text-[var(--color-dark-text)]"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                {c.score}% 匹配
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
})

// ==================== 美食足迹地图 ====================

const FoodFootprintMap = memo(function FoodFootprintMap({
  collectedProvinceIds,
}: {
  collectedProvinceIds: string[]
}) {
  const totalProvinces = provinceMeta.length
  const collectedCount = collectedProvinceIds.length
  const coveragePercent = Math.round((collectedCount / totalProvinces) * 100)

  return (
    <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] p-5">
      <h3 className="text-base font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
        🗾 美食足迹地图
      </h3>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            覆盖进度
          </span>
          <span className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-dark-primary)]">
            {collectedCount}/{totalProvinces}（{coveragePercent}%）
          </span>
        </div>
        <div className="w-full h-3 bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-orange-400 dark:from-[var(--color-dark-primary)] dark:to-orange-400 rounded-full transition-all"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
      </div>

      {/* 省份列表 */}
      <div className="flex flex-wrap gap-1.5">
        {provinceMeta.map((prov) => {
          const isCollected = collectedProvinceIds.includes(prov.id)
          return (
            <span
              key={prov.id}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors',
                isCollected
                  ? 'text-white font-medium'
                  : 'bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]'
              )}
              style={isCollected ? { backgroundColor: prov.color } : undefined}
              title={prov.name}
            >
              {isCollected ? '✓' : ''} {prov.name}
            </span>
          )
        })}
      </div>
    </div>
  )
})

// ==================== 排序控件 ====================

const SortControls = memo(function SortControls({
  activeSort,
  onSortChange,
}: {
  activeSort: SortKey
  onSortChange: (key: SortKey) => void
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
        排序：
      </span>
      <div className="flex gap-1" role="group" aria-label="排序方式">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key)}
            aria-pressed={activeSort === opt.key}
            className={cn(
              'px-2.5 py-1 min-h-[44px] rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer',
              activeSort === opt.key
                ? 'bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white'
                : 'bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
})

// ==================== 主页面 ====================

export default function FavoritesPage() {
  const { dishes: allDishes, loading, error } = useDishCache()
  const [activeTab, setActiveTab] = useState<Tab>('favorites')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const { state } = useApp()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dishesMap = useMemo(
    () => Object.fromEntries(allDishes.map((d) => [d.id, d])),
    [allDishes]
  )

  // Filter out orphan IDs that no longer exist in the dish dataset
  const favoriteDishes = useMemo(
    () => state.favorites.filter((id) => id in dishesMap).map((id) => dishesMap[id]),
    [state.favorites, dishesMap]
  )

  const eatenDishes = useMemo(
    () => state.eaten.filter((id) => id in dishesMap).map((id) => dishesMap[id]),
    [state.eaten, dishesMap]
  )

  const wantDishes = useMemo(
    () => state.wantToEat.filter((id) => id in dishesMap).map((id) => dishesMap[id]),
    [state.wantToEat, dishesMap]
  )

  // 排序后的菜品
  const sortedFavorites = useMemo(
    () => sortDishes(favoriteDishes, sortKey),
    [favoriteDishes, sortKey]
  )
  const sortedEaten = useMemo(
    () => sortDishes(eatenDishes, sortKey),
    [eatenDishes, sortKey]
  )
  const sortedWant = useMemo(
    () => sortDishes(wantDishes, sortKey),
    [wantDishes, sortKey]
  )

  // 统计数据
  const stats = useFavoritesStats(favoriteDishes)

  const handleSortChange = useCallback((key: SortKey) => setSortKey(key), [])

  const handleShare = useCallback(() => {
    if (!stats) return
    shareFavoritesStats({
      profile: stats.avgFlavors,
      total: stats.total,
      provinceCount: stats.collectedProvinces.length,
      eatenCount: state.eaten.length,
      wantCount: state.wantToEat.length,
    })
  }, [stats, state.eaten.length, state.wantToEat.length])

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importUserData(reader.result as string)
      addToast(result.success ? 'success' : 'info', result.message)
    }
    reader.readAsText(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }, [addToast])

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'favorites', label: '收藏', icon: '❤️', count: state.favorites.length },
    { key: 'eaten', label: '已吃过', icon: '✅', count: state.eaten.length },
    { key: 'want', label: '想吃', icon: '💭', count: state.wantToEat.length },
    { key: 'stats', label: '统计', icon: '📊', count: 0 },
  ]

  // 切换标签时重置排序
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    setSortKey('default')
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-6">❤️ 我的美食</h1>

      {/* 标签切换 */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              'flex items-center gap-1 px-4 py-2 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer',
              activeTab === tab.key
                ? 'bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white'
                : 'bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)]'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div role="alert" className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          ⚠️ 数据加载失败：{error}
        </div>
      )}

      {/* 内容 */}
      {activeTab === 'favorites' && (
        <div role="tabpanel" id="panel-favorites" aria-labelledby="tab-favorites" tabIndex={0}>
          {favoriteDishes.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">❤️</div>
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-4">还没有收藏菜品</p>
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-hover)] dark:hover:bg-[var(--color-dark-primary-hover)] transition-colors"
              >
                去地图上逛逛
              </Link>
            </div>
          ) : (
            <>
              <SortControls activeSort={sortKey} onSortChange={handleSortChange} />
              <DishList dishes={sortedFavorites} title="我的收藏" showFilter={false} loading={loading} />
            </>
          )}
        </div>
      )}

      {activeTab === 'eaten' && (
        <div role="tabpanel" id="panel-eaten" aria-labelledby="tab-eaten" tabIndex={0}>
          {eatenDishes.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">还没有记录吃过什么</p>
            </div>
          ) : (
            <>
              <SortControls activeSort={sortKey} onSortChange={handleSortChange} />
              <DishList dishes={sortedEaten} title="已吃过" showFilter={false} loading={loading} />
            </>
          )}
        </div>
      )}

      {activeTab === 'want' && (
        <div role="tabpanel" id="panel-want" aria-labelledby="tab-want" tabIndex={0}>
          {wantDishes.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">还没有想吃的菜品</p>
            </div>
          ) : (
            <>
              <SortControls activeSort={sortKey} onSortChange={handleSortChange} />
              <DishList dishes={sortedWant} title="想吃清单" showFilter={false} loading={loading} />
            </>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" tabIndex={0} className="space-y-6">
          {!stats ? (
            <div className="text-center py-16 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              <div className="text-4xl mb-3">📊</div>
              <p>还没有足够的数据</p>
              <p className="text-sm mt-1 text-[var(--color-text-secondary)]/70 dark:text-[var(--color-dark-text-secondary)]/70">收藏一些美食后再来看看吧</p>
            </div>
          ) : (
            <>
              {/* 口味 DNA 描述 */}
              <TasteDNACard avgFlavors={stats.avgFlavors} />

              {/* 口味偏好 */}
              <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] p-5">
                <h3 className="text-base font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
                  你的收藏口味偏好
                </h3>
                <div className="flex justify-center">
                  <FlavorRadar flavors={stats.avgFlavors} size={240} />
                </div>
              </div>

              {/* 美食足迹地图 */}
              <FoodFootprintMap collectedProvinceIds={stats.collectedProvinces} />

              {/* 省份分布 */}
              <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] p-5">
                <h3 className="text-base font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
                  收藏省份 Top 5
                </h3>
                <div className="space-y-2">
                  {stats.topProvinces.map(([provId, count]) => {
                    const meta = provinceMeta.find((p) => p.id === provId)
                    const percent = Math.round((count / stats.total) * 100)
                    return (
                      <div key={provId} className="flex items-center gap-3">
                        <span className="text-sm w-16 text-right text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                          {meta?.name || provId}
                        </span>
                        <div className="flex-1 h-5 bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: meta?.color || 'var(--color-primary)',
                            }}
                          />
                        </div>
                        <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] w-12">
                          {count}道
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 分类分布 */}
              <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] p-5">
                <h3 className="text-base font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
                  收藏分类分布
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(stats.catCount)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => (
                      <div
                        key={cat}
                        className="bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] rounded-lg p-3 text-center"
                      >
                        <div className="text-lg font-bold text-[var(--color-primary)] dark:text-[var(--color-dark-primary)]">{count}</div>
                        <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">{categoryLabels[cat as DishCategory] || cat}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 分享按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-[var(--color-primary)] to-orange-500 dark:from-[var(--color-dark-primary)] dark:to-orange-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>📤</span>
                  <span>分享我的美食画像</span>
                </button>
              </div>

              {/* 数据导出/导入 */}
              <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] p-5">
                <h3 className="text-base font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
                  数据管理
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadUserData}
                    className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)] text-[var(--color-text)] dark:text-[var(--color-dark-text)] rounded-lg text-sm font-medium border border-[var(--color-border)] dark:border-[var(--color-dark-divider)] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span>💾</span>
                    <span>导出数据</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)] text-[var(--color-text)] dark:text-[var(--color-dark-text)] rounded-lg text-sm font-medium border border-[var(--color-border)] dark:border-[var(--color-dark-divider)] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span>📂</span>
                    <span>导入数据</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <p className="mt-2 text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                  导出将保存为 JSON 文件，导入支持之前导出的备份文件。
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
