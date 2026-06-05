import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[RouteErrorBoundary${this.props.routeName ? `:${this.props.routeName}` : ''}]`, error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <span className="text-5xl mb-4">😵</span>
          <h2 className="text-lg font-bold mb-2 text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
            页面出了点问题
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-4 max-w-md">
            {this.state.error?.message || '渲染时发生错误，请尝试刷新页面'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              重试
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-primary)] transition-colors dark:bg-[var(--color-dark-surface)] dark:border-[var(--color-dark-border)] no-underline text-[var(--color-text)]"
            >
              返回首页
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
