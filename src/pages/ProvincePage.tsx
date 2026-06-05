import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { provinceMeta } from '../data/provinces'
import { useDishes } from '../hooks/useDishes'
import { useDishCache } from '../hooks/useDishCache'
import DishList from '../components/dish/DishList'

export default function ProvincePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const meta = useMemo(
    () => provinceMeta.find((p) => p.id === id),
    [id]
  )

  // 优先用全局缓存（已从 Supabase 加载），缓存为空且加载完毕后才回退到独立请求
  const cache = useDishCache()

  const cachedDishes = useMemo(
    () => (id ? cache.dishes.filter((d) => d.province_id === id) : []),
    [cache.dishes, id]
  )

  const hasCachedData = cachedDishes.length > 0
  const shouldFetchDirect = !hasCachedData && !cache.loading

  const direct = useDishes({ provinceId: id, enabled: shouldFetchDirect })

  // 缓存有数据就用缓存，否则用独立查询
  const dishes = hasCachedData ? cachedDishes : direct.dishes
  const loading = hasCachedData ? false : (cache.loading || direct.loading)
  const error = hasCachedData ? cache.error : (direct.error || cache.error)

  const { markProvinceVisited } = useApp()

  useEffect(() => {
    if (id) markProvinceVisited(id)
  }, [id, markProvinceVisited])

  if (!meta) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-3">🤔</div>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">未找到该省份</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-lg text-sm cursor-pointer"
        >
          返回地图
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      {/* 面包屑导航 */}
      <nav aria-label="面包屑导航" className="mb-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-dark-primary)] transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"
            />
          </svg>
          首页
        </button>
        <span className="text-[var(--color-divider)] dark:text-[var(--color-dark-divider)]">/</span>
        <span className="text-[var(--color-primary)] dark:text-[var(--color-dark-primary)] font-medium">{meta.name}</span>
      </nav>

      {/* 省份信息 */}
      <div
        className="rounded-2xl p-6 mb-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{meta.name}</h1>
            <p className="text-sm text-white/80">
              {meta.cuisine_family} · {meta.region}
            </p>
          </div>
          <span className="text-4xl">🍽️</span>
        </div>
        <p className="mt-3 text-sm text-white/90 leading-relaxed">
          {meta.description}
        </p>
        <div className="mt-3 text-sm text-white/70">
          {error ? '⚠️ 数据加载失败' : `共收录 ${dishes.length} 道美食`}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          ⚠️ 数据加载失败：{error}
        </div>
      )}

      {/* 美食列表 */}
      {dishes.length === 0 && !loading && !error ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🍃</div>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">暂未收录{meta.name}的菜品</p>
        </div>
      ) : (
        <DishList
          dishes={dishes}
          title={`${meta.name}美食`}
          loading={loading}
        />
      )}
    </div>
  )
}
