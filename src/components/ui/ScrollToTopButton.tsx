import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { SCROLL_SHOW_THRESHOLD_PX } from '../../constants'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_SHOW_THRESHOLD_PX)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到顶部"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-12 h-12 rounded-full',
        'bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white',
        'shadow-lg cursor-pointer',
        'flex items-center justify-center',
        'transition-all duration-300',
        'hover:bg-[var(--color-primary-hover)] dark:hover:bg-[var(--color-dark-primary-hover)] hover:shadow-xl hover:scale-105',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
