import { Link } from 'react-router-dom'

const footerLinks = [
  { path: '/', label: '地图' },
  { path: '/taste-test', label: '口味测试' },
  { path: '/food-clock', label: '美食时钟' },
  { path: '/search', label: '搜索' },
  { path: '/favorites', label: '收藏' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 dark:bg-[var(--color-dark-surface)]/95 dark:border-[var(--color-dark-border)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 项目信息 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🍜</span>
            <span className="text-lg font-bold text-[var(--color-primary)] dark:text-[var(--color-dark-primary)]">
              味觉地图
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] max-w-md mx-auto">
            探索中国每一个角落的美食风味，发现属于你的味觉记忆
          </p>
        </div>

        {/* 导航链接 */}
        <nav
          aria-label="页脚导航"
          className="flex flex-wrap items-center justify-center gap-4 mb-6"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] no-underline transition-colors dark:text-[var(--color-dark-text-secondary)] dark:hover:text-[var(--color-dark-primary)] min-h-[44px] flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 版权信息 */}
        <div className="text-center text-xs text-[var(--color-text-secondary)]/60 dark:text-[var(--color-dark-text-secondary)]/60">
          <p>&copy; {new Date().getFullYear()} 味觉地图 &middot; 美食探索之旅</p>
        </div>
      </div>
    </footer>
  )
}
