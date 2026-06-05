import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChinaMap from './ChinaMap'
import { loadChinaMapPaths, type ProvincePath } from '../../data/map/geoLoader'
import { useDishCache } from '../../hooks/useDishCache'
import type { Dish } from '../../types'

vi.mock('../../data/map/geoLoader', () => ({
  loadChinaMapPaths: vi.fn().mockResolvedValue([
    { id: 'beijing', name: '北京', d: 'M0,0L100,0L100,100L0,100Z' },
    { id: 'shanghai', name: '上海', d: 'M200,200L300,200L300,300L200,300Z' },
  ] as ProvincePath[]),
  loadProvinceCountyPaths: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../hooks/useDishCache', () => ({
  useDishCache: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderWithProviders(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const mockDish: Dish = {
  id: '1',
  name: '烤鸭',
  province_id: 'beijing',
  county_id: null,
  category: 'main',
  tags: [],
  spicy: 0,
  sweet: 0,
  sour: 0,
  salty: 0,
  umami: 0,
  numbing: 0,
  bitter: 0,
  aromatic: 0,
  cooking_methods: [],
  main_ingredients: [],
  difficulty: 1,
  recipe: null,
  story: null,
  history: null,
  best_season: 'all',
  related_solar_terms: [],
  emoji: '🦆',
  description: null,
  pairing_drink: null,
  pairing_side: null,
  pairing_staple: null,
  created_at: '2024-01-01',
}

describe('ChinaMap', () => {
  beforeEach(() => {
    vi.mocked(useDishCache).mockReturnValue({
      dishes: [],
      loading: false,
      error: null,
      retry: vi.fn(),
    })
    vi.mocked(loadChinaMapPaths).mockResolvedValue([
      { id: 'beijing', name: '北京', d: 'M0,0L100,0L100,100L0,100Z' },
      { id: 'shanghai', name: '上海', d: 'M200,200L300,200L300,300L200,300Z' },
    ])
    mockNavigate.mockClear()
  })

  it('renders the map SVG container', async () => {
    renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(screen.getByLabelText(/中国美食地图/)).toBeInTheDocument()
    })
  })

  it('shows loading state while province paths are loading', () => {
    vi.mocked(loadChinaMapPaths).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<ChinaMap />)
    expect(screen.getByText('地图加载中...')).toBeInTheDocument()
  })

  it('renders province paths after loading', async () => {
    const { container } = renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(container.querySelector('[data-province-id="beijing"]')).toBeInTheDocument()
    })
    expect(container.querySelector('[data-province-id="shanghai"]')).toBeInTheDocument()
  })

  it('shows province name on hover (tooltip)', async () => {
    const { container } = renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(container.querySelector('[data-province-id="beijing"]')).toBeInTheDocument()
    })
    const beijingPath = container.querySelector('[data-province-id="beijing"]')!
    fireEvent.mouseOver(beijingPath)
    await waitFor(() => {
      expect(screen.getByText('京菜 · 华北')).toBeInTheDocument()
    })
  })

  it('navigates to province page on click', async () => {
    const { container } = renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(container.querySelector('[data-province-id="beijing"]')).toBeInTheDocument()
    })
    const beijingPath = container.querySelector('[data-province-id="beijing"]')!
    fireEvent.click(beijingPath)
    expect(mockNavigate).toHaveBeenCalledWith('/province/beijing')
  })

  it('shows dish count in tooltip when dishes are available', async () => {
    vi.mocked(useDishCache).mockReturnValue({
      dishes: [mockDish],
      loading: false,
      error: null,
      retry: vi.fn(),
    })
    const { container } = renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(container.querySelector('[data-province-id="beijing"]')).toBeInTheDocument()
    })
    const beijingPath = container.querySelector('[data-province-id="beijing"]')!
    fireEvent.mouseOver(beijingPath)
    await waitFor(() => {
      expect(screen.getByText(/收录 1 道美食/)).toBeInTheDocument()
    })
  })

  it('handles zoom in/out via MapControls buttons', async () => {
    renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(screen.getByLabelText('放大')).toBeInTheDocument()
    })

    const svg = screen.getByLabelText(/中国美食地图/)
    const g = svg.querySelector('g[transform]')!

    expect(g).toHaveAttribute('transform', 'translate(0, 0) scale(1)')

    fireEvent.click(screen.getByLabelText('放大'))
    expect(g).toHaveAttribute('transform', 'translate(0, 0) scale(1.2)')

    fireEvent.click(screen.getByLabelText('缩小'))
    expect(g).toHaveAttribute('transform', 'translate(0, 0) scale(1)')
  })

  it('reset zoom returns to default view', async () => {
    renderWithProviders(<ChinaMap />)
    await waitFor(() => {
      expect(screen.getByLabelText('放大')).toBeInTheDocument()
    })

    const svg = screen.getByLabelText(/中国美食地图/)
    const g = svg.querySelector('g[transform]')!

    fireEvent.click(screen.getByLabelText('放大'))
    expect(g).toHaveAttribute('transform', 'translate(0, 0) scale(1.2)')

    fireEvent.click(screen.getByLabelText('重置视图'))
    expect(g).toHaveAttribute('transform', 'translate(0, 0) scale(1)')
  })
})
