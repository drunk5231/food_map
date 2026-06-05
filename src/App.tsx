import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollToTopButton from './components/ui/ScrollToTopButton'
import { ToastContainer } from './components/ui/Toast'
import RouteErrorBoundary from './components/RouteErrorBoundary'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const HomePage = lazy(() => import('./pages/HomePage'))
const ProvincePage = lazy(() => import('./pages/ProvincePage'))
const TasteTestPage = lazy(() => import('./pages/TasteTestPage'))
const FoodClockPage = lazy(() => import('./pages/FoodClockPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="text-4xl mb-2 clock-pulse">🍜</div>
        <p className="text-sm text-[var(--color-text-secondary)]">加载中...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-lg focus:text-sm">
        跳转到主要内容
      </a>
      <ScrollToTop />
      <Header />
      <ScrollToTopButton />
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<RouteErrorBoundary routeName="HomePage"><HomePage /></RouteErrorBoundary>} />
            <Route path="/province/:id" element={<RouteErrorBoundary routeName="ProvincePage"><ProvincePage /></RouteErrorBoundary>} />
            <Route path="/taste-test" element={<RouteErrorBoundary routeName="TasteTestPage"><TasteTestPage /></RouteErrorBoundary>} />
            <Route path="/food-clock" element={<RouteErrorBoundary routeName="FoodClockPage"><FoodClockPage /></RouteErrorBoundary>} />
            <Route path="/favorites" element={<RouteErrorBoundary routeName="FavoritesPage"><FavoritesPage /></RouteErrorBoundary>} />
            <Route path="/search" element={<RouteErrorBoundary routeName="SearchPage"><SearchPage /></RouteErrorBoundary>} />
            <Route path="*" element={<RouteErrorBoundary routeName="NotFoundPage"><NotFoundPage /></RouteErrorBoundary>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}
