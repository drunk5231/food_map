import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">😵</div>
            <h1 className="text-xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-2">
              页面出了点问题
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-4">
              页面遇到了意外错误，请刷新页面重试
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <pre className="text-xs text-left text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] p-3 rounded-lg mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-6 py-2 bg-[var(--color-primary)] dark:bg-[var(--color-dark-primary)] text-white rounded-lg text-sm cursor-pointer hover:bg-[var(--color-primary-hover)] dark:hover:bg-[var(--color-dark-primary-hover)]"
            >
              返回首页
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
