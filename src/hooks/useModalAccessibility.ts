import { useEffect, useRef } from 'react'

/**
 * Shared modal accessibility logic:
 * - Body scroll lock on mount/unmount
 * - Focus trap (Tab / Shift+Tab cycling within modal)
 * - Escape key handler
 * - Focus restoration on close (saves previously focused element, restores on unmount)
 */
export function useModalAccessibility(onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // On mount: save previous focus, lock body scroll, focus first focusable element.
  // On unmount: restore focus and scroll.
  useEffect(() => {
    const active = document.activeElement
    previousFocusRef.current = active instanceof HTMLElement ? active : null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const modal = modalRef.current
    if (modal) {
      const focusable = modal.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
    return () => {
      document.body.style.overflow = prevOverflow
      previousFocusRef.current?.focus()
    }
  }, [])

  // Focus trap + Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const modal = modalRef.current
      if (!modal) return
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return modalRef
}
