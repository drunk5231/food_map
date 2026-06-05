import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { TOAST_DURATION_MS } from '../../constants'

// ==================== Types ====================
export type ToastType = 'success' | 'info' | 'achievement'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void
  toasts: Toast[]
  removeToast: (id: string) => void
}

// ==================== Context ====================
const ToastContext = createContext<ToastContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): { addToast: (type: ToastType, message: string) => void } {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return { addToast: ctx.addToast }
}

function useToastInternal(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastInternal must be used within ToastProvider')
  return ctx
}

// ==================== Provider ====================
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo(() => ({ addToast, toasts, removeToast }), [addToast, toasts, removeToast])

  useEffect(() => {
    const handler = () => addToast('info', '存储空间不足，部分数据可能无法保存。请清理浏览器缓存。')
    window.addEventListener('storage-quota-exceeded', handler)
    return () => window.removeEventListener('storage-quota-exceeded', handler)
  }, [addToast])

  // Listen for show-toast CustomEvents dispatched from non-React utilities
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, message } = (e as CustomEvent).detail
      addToast(type ?? 'info', message)
    }
    window.addEventListener('show-toast', handler)
    return () => window.removeEventListener('show-toast', handler)
  }, [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

// ==================== Toast styles & icons ====================
const TOAST_STYLES: Record<ToastType, string> = {
  success:
    'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
  info:
    'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
  achievement:
    'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-300/40',
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✅',
  info: 'ℹ️',
  achievement: '🏆',
}

// ==================== Toast Item ====================
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => onRemove(toast.id), 300)
      return () => clearTimeout(timer)
    }
  }, [exiting, toast.id, onRemove])

  return (
    <div
      className={`
        animate-slide-in-toast
        flex items-center gap-3 px-4 py-3 rounded-xl
        text-sm font-medium shadow-lg
        transition-all duration-300 ease-out
        ${TOAST_STYLES[toast.type]}
        ${exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <span className="text-lg flex-shrink-0">{TOAST_ICONS[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => setExiting(true)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  )
}

// ==================== Container ====================
export function ToastContainer() {
  const { toasts, removeToast } = useToastInternal()

  if (toasts.length === 0) return null

  return (
    <div aria-live="polite" role="status" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}
