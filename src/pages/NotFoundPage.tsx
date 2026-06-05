import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl mb-6">🍜❓</div>

      <h1 className="text-3xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-3">
        页面未找到
      </h1>

      <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] max-w-md mb-8 leading-relaxed">
        抱歉，你要找的页面似乎走丢了。也许它去寻找美食了？
        <br />
        试试回到首页重新探索吧。
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors no-underline dark:bg-[var(--color-dark-primary)] dark:hover:bg-[var(--color-dark-primary-hover)]"
      >
        🏠 返回首页
      </Link>
    </div>
  )
}
