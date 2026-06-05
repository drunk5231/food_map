import { useState, useMemo, useDeferredValue, useCallback, memo } from 'react'
import type { DishCategory, CookingMethod } from '../types'
import { useDishCache } from '../hooks/useDishCache'
import { useFilteredDishes, type SortOption } from '../hooks/useFilteredDishes'
import DishList from '../components/dish/DishList'
import FilterChipGroup from '../components/ui/FilterChipGroup'
import { categoryLabels, cookingMethodLabels, provinceMeta } from '../data/provinces'
import { hotSearchCategories } from '../data/hotSearches'
import {
  loadSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
} from '../utils/storage'
import { cn } from '../utils/cn'

// ==================== 排序选项 ====================

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'default', label: '默认' },
  { value: 'spicy_desc', label: '辣度高→低' },
  { value: 'sweet_desc', label: '甜度高→低' },
  { value: 'difficulty_asc', label: '难度低→高' },
]

// ==================== 搜索历史组件 ====================

interface SearchHistorySectionProps {
  history: string[]
  onSelect: (keyword: string) => void
  onRemove: (keyword: string) => void
  onClearAll: () => void
}

const SearchHistorySection = memo(function SearchHistorySection({
  history,
  onSelect,
  onRemove,
  onClearAll,
}: SearchHistorySectionProps) {
  if (history.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
          搜索历史
        </h2>
        <button
          onClick={onClearAll}
          className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-dark-primary)] cursor-pointer min-h-[44px] px-2"
        >
          清除全部
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((keyword) => (
          <div
            key={keyword}
            className="group flex items-center gap-1 bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-full pl-3 pr-1 py-1"
          >
            <button
              onClick={() => onSelect(keyword)}
              className="text-sm text-[var(--color-text)] dark:text-[var(--color-dark-text)] cursor-pointer hover:text-[var(--color-primary)] dark:hover:text-[var(--color-dark-primary)]"
            >
              {keyword}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(keyword)
              }}
              className="ml-1 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-bg)] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`移除搜索记录: ${keyword}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
})

// ==================== 热门搜索组件 ====================

interface HotSearchSectionProps {
  onSelect: (keyword: string) => void
}

const HotSearchSection = memo(function HotSearchSection({
  onSelect,
}: HotSearchSectionProps) {
  return (
    <div className="space-y-5">
      {hotSearchCategories.map((category) => (
        <div key={category.label}>
          <h2 className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
            {category.icon} {category.label}
          </h2>
          <div className="flex flex-wrap gap-2">
            {category.items.map((keyword) => (
              <button
                key={keyword}
                onClick={() => onSelect(keyword)}
                className={cn(
                  'px-3 py-1.5 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer',
                  'bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]',
                  'border border-[var(--color-border)] dark:border-[var(--color-dark-border)]',
                  'hover:border-[var(--color-primary)] dark:hover:border-[var(--color-dark-primary)]',
                  'hover:text-[var(--color-primary)] dark:hover:text-[var(--color-dark-primary)]'
                )}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
})

// ==================== 主页面 ====================

export default function SearchPage() {
  const { dishes: allDishes, loading, error } = useDishCache()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | ''>('')
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod | ''>('')
  const [minSpicy, setMinSpicy] = useState(0)
  const [maxDifficulty, setMaxDifficulty] = useState(5)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [searchHistory, setSearchHistory] = useState<string[]>(() => loadSearchHistory())

  const handleSearchSubmit = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim()
      if (!trimmed) return
      setSearch(trimmed)
      setSearchHistory(addSearchHistory(trimmed))
    },
    []
  )

  const handleRemoveHistory = useCallback((keyword: string) => {
    setSearchHistory(removeSearchHistoryItem(keyword))
  }, [])

  const handleClearAllHistory = useCallback(() => {
    clearSearchHistory()
    setSearchHistory([])
  }, [])

  const handleHistorySelect = useCallback(
    (keyword: string) => {
      setSearch(keyword)
      setSearchHistory(addSearchHistory(keyword))
    },
    []
  )

  const handleHotSelect = useCallback(
    (keyword: string) => {
      setSearch(keyword)
      setSearchHistory(addSearchHistory(keyword))
    },
    []
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
    },
    []
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearchSubmit(search)
      }
    },
    [search, handleSearchSubmit]
  )

  const categoryOptions = useMemo(
    () => [
      { value: '' as DishCategory | '', label: '全部' },
      ...Object.entries(categoryLabels).map(([key, label]) => ({ value: key as DishCategory | '', label })),
    ],
    []
  )

  const methodOptions = useMemo(
    () => [
      { value: '' as CookingMethod | '', label: '全部' },
      ...Object.entries(cookingMethodLabels).map(([key, label]) => ({ value: key as CookingMethod | '', label })),
    ],
    []
  )

  const filtered = useFilteredDishes(allDishes, {
    search: deferredSearch,
    province: selectedProvince,
    category: selectedCategory,
    method: selectedMethod,
    minSpicy,
    maxDifficulty,
    sortBy,
  })

  const hasFilters = selectedProvince || selectedCategory || selectedMethod || minSpicy > 0 || maxDifficulty < 5

  const showEmptyState = !deferredSearch && !loading
  const showHistory = showEmptyState && searchHistory.length > 0
  const showHotSearches = showEmptyState && searchHistory.length === 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-6">🔍 搜索美食</h1>

      {/* 搜索框 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="搜索菜名、食材、标签..."
            aria-label="搜索菜名、食材或标签"
            className="w-full px-4 py-3 pl-10 bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-xl text-[var(--color-text)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-secondary)]/50 dark:placeholder:text-[var(--color-dark-text-secondary)]/50 focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-1 focus:border-[var(--color-primary)] dark:focus:border-[var(--color-dark-primary)]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-bg)] cursor-pointer"
              aria-label="清除搜索"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 搜索历史和热门搜索（搜索框为空时显示） */}
      {showHistory && (
        <SearchHistorySection
          history={searchHistory}
          onSelect={handleHistorySelect}
          onRemove={handleRemoveHistory}
          onClearAll={handleClearAllHistory}
        />
      )}

      {showHotSearches && (
        <div className="mb-6">
          <HotSearchSection onSelect={handleHotSelect} />
        </div>
      )}

      {/* 筛选开关 */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        aria-expanded={showFilters}
        className="mb-4 flex items-center gap-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-dark-primary)] cursor-pointer min-h-[44px] px-3 py-2"
      >
        {showFilters ? '收起筛选' : '展开筛选'}
        {hasFilters && (
          <span className="bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white text-xs px-1.5 py-0.5 rounded-full">
            已筛选
          </span>
        )}
      </button>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-xl p-4 mb-4 space-y-4 animate-slide-in-up">
          {/* 省份 */}
          <div>
            <label htmlFor="search-province" className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] block mb-1">省份</label>
            <select
              id="search-province"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-lg text-sm text-[var(--color-text)] dark:text-[var(--color-dark-text)] focus:outline-none focus:border-[var(--color-primary)] dark:focus:border-[var(--color-dark-primary)]"
            >
              <option value="">全部省份</option>
              {provinceMeta.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* 分类 */}
          <div>
            <label className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] block mb-1">分类</label>
            <FilterChipGroup
              options={categoryOptions}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* 烹饪方式 */}
          <div>
            <label className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] block mb-1">烹饪方式</label>
            <FilterChipGroup
              options={methodOptions}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
          </div>

          {/* 辣度 */}
          <div>
            <label htmlFor="search-spicy" className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] block mb-1">
              最低辣度：{minSpicy}
            </label>
            <input
              id="search-spicy"
              type="range"
              min={0}
              max={10}
              value={minSpicy}
              onChange={(e) => setMinSpicy(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)] dark:accent-[var(--color-dark-primary)]"
            />
          </div>

          {/* 难度 */}
          <div>
            <label htmlFor="search-difficulty" className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] block mb-1">
              最高烹饪难度：{'⭐'.repeat(maxDifficulty)}
            </label>
            <input
              id="search-difficulty"
              type="range"
              min={1}
              max={5}
              value={maxDifficulty}
              onChange={(e) => setMaxDifficulty(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)] dark:accent-[var(--color-dark-primary)]"
            />
          </div>

          {/* 重置 */}
          <button
            onClick={() => {
              setSelectedProvince('')
              setSelectedCategory('')
              setSelectedMethod('')
              setMinSpicy(0)
              setMaxDifficulty(5)
            }}
            className="text-sm text-[var(--color-primary)] dark:text-[var(--color-dark-primary)] hover:underline cursor-pointer min-h-[44px] px-3 py-2"
          >
            重置筛选
          </button>
        </div>
      )}

      {/* 排序选项（有搜索结果时显示） */}
      {(deferredSearch || hasFilters) && !loading && (
        <div className="mb-4">
          <label className="text-sm font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] block mb-2">排序方式</label>
          <FilterChipGroup
            options={sortOptions}
            selected={sortBy}
            onSelect={setSortBy}
          />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400" role="alert">
          ⚠️ 数据加载失败：{error}
        </div>
      )}

      {/* 结果 */}
      {!showEmptyState && filtered.length === 0 && !loading ? (
        <div className="text-center py-16" aria-live="polite">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-1">没有找到相关菜品</p>
          <p className="text-sm text-[var(--color-text-secondary)]/70 dark:text-[var(--color-dark-text-secondary)]/70">试试换个关键词或调整筛选条件</p>
        </div>
      ) : !showEmptyState ? (
        <DishList
          dishes={filtered}
          title={`搜索结果（${filtered.length}）`}
          showFilter={false}
          loading={loading}
        />
      ) : null}
    </div>
  )
}
