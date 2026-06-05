import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { path: '/', label: '美食地图', icon: '🗺️' },
  { path: '/taste-test', label: '口味DNA', icon: '🧬' },
  { path: '/food-clock', label: '美食时钟', icon: '🕐' },
  { path: '/search', label: '搜索', icon: '🔍' },
  { path: '/favorites', label: '我的', icon: '❤️' },
]

export default function Header() {
  const location = useLocation()
  const { user, authLoading, signInWithEmail, verifyOtp, signOut } = useApp()
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = email.trim()
      if (!trimmed) return
      setSending(true)
      setError('')
      try {
        await signInWithEmail(trimmed)
        setSent(true)
      } catch (err) {
        // 429 = rate limit but email may still have been sent
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('429') || msg.includes('rate')) {
          setSent(true) // show OTP input anyway — email was likely sent
        } else {
          setError('发送失败，请检查邮箱地址')
        }
      } finally {
        setSending(false)
      }
    },
    [email, signInWithEmail],
  )

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = otp.trim()
      if (!trimmed || trimmed.length !== 6) return
      setVerifying(true)
      setError('')
      try {
        await verifyOtp(email, trimmed)
        // onAuthStateChange will fire and close the modal
      } catch {
        setError('验证码错误或已过期，请重新发送')
      } finally {
        setVerifying(false)
      }
    },
    [email, otp, verifyOtp],
  )

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
    } catch {
      // ignore logout errors
    }
  }, [signOut])

  const closeLogin = useCallback(() => {
    setShowLogin(false)
    setEmail('')
    setOtp('')
    setSent(false)
    setError('')
  }, [])

  // Reset login modal state when user authenticates (e.g. via magic link)
  const prevUserRef = useRef(user)
  useEffect(() => {
    if (user && !prevUserRef.current) {
      closeLogin()
    }
    prevUserRef.current = user
  }, [user, closeLogin])

  // Hide login modal when user is authenticated
  const showLoginModal = showLogin && !user

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)] dark:bg-[var(--color-dark-surface)]/95 dark:border-[var(--color-dark-border)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between min-h-[3.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline" aria-label="味觉地图 - 首页">
            <span className="text-2xl">🍜</span>
            <span className="text-lg font-bold hidden sm:inline text-[var(--color-title-blue)]">
              味觉地图
            </span>
          </Link>

          {/* 导航 */}
          <nav aria-label="主导航" className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-full text-sm no-underline transition-colors',
                    isActive
                      ? 'bg-[var(--color-primary)] text-white dark:bg-[var(--color-dark-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] dark:text-[var(--color-dark-text-secondary)] dark:hover:bg-[var(--color-dark-border)] dark:hover:text-[var(--color-dark-primary)]'
                  )}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
            <ThemeToggle />
            {isSupabaseConfigured && !authLoading && (
              user ? (
                <div className="flex items-center gap-2 ml-1">
                  <span
                    className="hidden sm:inline text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] max-w-[120px] truncate"
                    title={user.email}
                  >
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors cursor-pointer text-sm',
                      'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-primary)]',
                      'dark:bg-[var(--color-dark-surface)] dark:text-[var(--color-dark-text)] dark:hover:bg-[var(--color-dark-border)] dark:hover:text-[var(--color-dark-primary)]'
                    )}
                    aria-label="退出登录"
                    title="退出登录"
                  >
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className={cn(
                    'ml-1 px-3 py-2 min-h-[44px] rounded-full flex items-center gap-1 text-sm transition-colors cursor-pointer',
                    'bg-[var(--color-primary)] text-white hover:opacity-90',
                    'dark:bg-[var(--color-dark-primary)]'
                  )}
                  aria-label="登录"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden sm:inline">登录</span>
                </button>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeLogin}
          role="dialog"
          aria-modal="true"
          aria-label="登录"
        >
          <div
            className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
                登录
              </h2>
              <button
                onClick={closeLogin}
                className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] dark:text-[var(--color-dark-text-secondary)] dark:hover:bg-[var(--color-dark-border)] transition-colors cursor-pointer"
                aria-label="关闭"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {sent ? (
              <form onSubmit={handleVerify}>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-4">
                  验证码已发送到 <strong>{email}</strong>，请输入邮件中的6位数字。
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)]/30 text-[var(--color-text)] dark:text-[var(--color-dark-text)] text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-[var(--color-primary)] dark:focus:border-[var(--color-dark-primary)] transition-colors"
                />
                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={verifying || otp.length !== 6}
                  className={cn(
                    'w-full mt-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                    'bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50',
                    'dark:bg-[var(--color-dark-primary)]'
                  )}
                >
                  {verifying ? '验证中...' : '验证登录'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSent(false); setOtp(''); setError('') }}
                  className="w-full mt-2 py-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                >
                  重新输入邮箱
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-4">
                  输入邮箱，我们会发送一个免密码的登录链接。
                </p>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-border)]/30 text-[var(--color-text)] dark:text-[var(--color-dark-text)] text-sm outline-none focus:border-[var(--color-primary)] dark:focus:border-[var(--color-dark-primary)] transition-colors"
                />
                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className={cn(
                    'w-full mt-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                    'bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50',
                    'dark:bg-[var(--color-dark-primary)]'
                  )}
                >
                  {sending ? '发送中...' : '发送登录链接'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
