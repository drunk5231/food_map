import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastProvider, ToastContainer, useToast } from './Toast'
import { TOAST_DURATION_MS } from '../../constants'

// Helper component to trigger toasts from tests
function ToastTrigger({ type, message }: { type: 'success' | 'info' | 'achievement'; message: string }) {
  const { addToast } = useToast()
  return (
    <button onClick={() => addToast(type, message)} data-testid="trigger">
      Add Toast
    </button>
  )
}

function renderWithProvider(ui: React.ReactNode) {
  return render(
    <ToastProvider>
      {ui}
      <ToastContainer />
    </ToastProvider>
  )
}

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('ToastProvider renders children', () => {
    render(
      <ToastProvider>
        <div>child content</div>
      </ToastProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('addToast shows a toast message', () => {
    renderWithProvider(
      <ToastTrigger type="success" message="操作成功" />
    )

    fireEvent(screen.getByTestId('trigger'), new MouseEvent('click', { bubbles: true }))
    expect(screen.getByText('操作成功')).toBeInTheDocument()
  })

  it('Toast auto-dismisses after duration', () => {
    vi.useFakeTimers()
    renderWithProvider(
      <ToastTrigger type="info" message="自动消失" />
    )

    const trigger = screen.getByTestId('trigger')
    act(() => {
      trigger.click()
    })

    expect(screen.getByText('自动消失')).toBeInTheDocument()

    // Phase 1: advance past TOAST_DURATION_MS to trigger setExiting(true)
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS)
    })

    // Phase 2: advance past the 300ms exit animation to trigger onRemove
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.queryByText('自动消失')).not.toBeInTheDocument()
  })

  it('achievement toast has special styling', () => {
    renderWithProvider(
      <ToastTrigger type="achievement" message="解锁成就！" />
    )

    const trigger = screen.getByTestId('trigger')
    act(() => {
      trigger.click()
    })

    // Achievement toasts use the trophy icon
    expect(screen.getByText('🏆')).toBeInTheDocument()
    expect(screen.getByText('解锁成就！')).toBeInTheDocument()
  })

  it('multiple toasts stack correctly', () => {
    renderWithProvider(
      <>
        <ToastTrigger type="success" message="第一个" />
        <ToastTrigger type="info" message="第二个" />
        <ToastTrigger type="achievement" message="第三个" />
      </>
    )

    const triggers = screen.getAllByTestId('trigger')

    act(() => {
      triggers[0].click()
      triggers[1].click()
      triggers[2].click()
    })

    expect(screen.getByText('第一个')).toBeInTheDocument()
    expect(screen.getByText('第二个')).toBeInTheDocument()
    expect(screen.getByText('第三个')).toBeInTheDocument()

    // All three icons should be present
    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.getByText('ℹ️')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })
})
