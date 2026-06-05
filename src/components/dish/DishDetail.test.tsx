import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DishDetail from './DishDetail'
import type { Dish } from '../../types'

vi.mock('./FlavorRadar', () => ({
  default: ({ flavors }: { flavors: Record<string, number> }) => (
    <div data-testid="flavor-radar">MockRadar-{JSON.stringify(flavors)}</div>
  ),
}))

vi.mock('../../utils/share', () => ({
  shareDish: vi.fn(() => Promise.resolve()),
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const mockDish: Dish = {
  id: 'dish-1',
  name: '红烧肉',
  province_id: 'shanghai',
  county_id: null,
  category: 'main',
  tags: ['经典', '家常'],
  spicy: 2,
  sweet: 5,
  sour: 0,
  salty: 4,
  umami: 6,
  numbing: 0,
  bitter: 0,
  aromatic: 8,
  cooking_methods: ['braise', 'stir_fry'],
  main_ingredients: ['五花肉', '酱油', '冰糖'],
  difficulty: 3,
  recipe: '五花肉切块焯水。锅中放油和冰糖炒糖色。加入肉块翻炒上色。加入酱油、料酒和水，小火炖一小时。',
  story: '红烧肉是中国最经典的家常菜之一，深受全国各地人民的喜爱。',
  history: '起源可追溯至宋代，苏东坡对其做法有重要贡献。',
  best_season: 'winter',
  related_solar_terms: [],
  emoji: '🍖',
  description: '色泽红亮、肥而不腻的经典上海红烧肉',
  pairing_drink: '黄酒',
  pairing_side: '清炒时蔬',
  pairing_staple: '米饭',
  created_at: '2024-01-01',
}

describe('DishDetail', () => {
  it('renders dish name', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText('红烧肉')).toBeInTheDocument()
  })

  it('renders dish description', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText(/色泽红亮/)).toBeInTheDocument()
  })

  it('renders dish emoji', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText('🍖')).toBeInTheDocument()
  })

  it('shows flavor radar chart', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByTestId('flavor-radar')).toBeInTheDocument()
  })

  it('shows ingredients list', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText('五花肉')).toBeInTheDocument()
    expect(screen.getByText('酱油')).toBeInTheDocument()
    expect(screen.getByText('冰糖')).toBeInTheDocument()
  })

  it('shows cooking methods', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText('炖/烧')).toBeInTheDocument()
    expect(screen.getByText('炒')).toBeInTheDocument()
  })

  it('shows recipe steps', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText(/五花肉切块焯水/)).toBeInTheDocument()
  })

  it('shows difficulty stars', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText(/⭐⭐⭐/)).toBeInTheDocument()
    expect(screen.getByText('(3/5)')).toBeInTheDocument()
  })

  it('shows season info', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText(/冬季/)).toBeInTheDocument()
  })

  it('shows pairings', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText(/黄酒/)).toBeInTheDocument()
    expect(screen.getByText(/清炒时蔬/)).toBeInTheDocument()
    expect(screen.getByText(/米饭/)).toBeInTheDocument()
  })

  it('shows story/history', () => {
    renderWithProviders(<DishDetail dish={mockDish} />)
    expect(screen.getByText(/红烧肉是中国最经典的家常菜之一/)).toBeInTheDocument()
    expect(screen.getByText(/苏东坡/)).toBeInTheDocument()
  })

  it('favorite button toggles correctly', () => {
    const onToggleFavorite = vi.fn()
    const { rerender } = renderWithProviders(
      <DishDetail dish={mockDish} isFavorite={false} onToggleFavorite={onToggleFavorite} />
    )
    const favButton = screen.getByRole('button', { name: /收藏/ })
    expect(favButton).toBeInTheDocument()
    expect(favButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(favButton)
    expect(onToggleFavorite).toHaveBeenCalledTimes(1)

    rerender(
      <BrowserRouter>
        <DishDetail dish={mockDish} isFavorite onToggleFavorite={onToggleFavorite} />
      </BrowserRouter>
    )
    const favButtonActive = screen.getByRole('button', { name: /已收藏/ })
    expect(favButtonActive).toHaveAttribute('aria-pressed', 'true')
  })

  it('eaten button toggles correctly', () => {
    const onToggleEaten = vi.fn()
    const { rerender } = renderWithProviders(
      <DishDetail dish={mockDish} isEaten={false} onToggleEaten={onToggleEaten} />
    )
    const eatenButton = screen.getByRole('button', { name: /吃过/ })
    expect(eatenButton).toBeInTheDocument()
    expect(eatenButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(eatenButton)
    expect(onToggleEaten).toHaveBeenCalledTimes(1)

    rerender(
      <BrowserRouter>
        <DishDetail dish={mockDish} isEaten onToggleEaten={onToggleEaten} />
      </BrowserRouter>
    )
    const eatenButtonActive = screen.getByRole('button', { name: /吃过/ })
    expect(eatenButtonActive).toHaveAttribute('aria-pressed', 'true')
  })

  it('wantToEat button toggles correctly', () => {
    const onToggleWantToEat = vi.fn()
    const { rerender } = renderWithProviders(
      <DishDetail dish={mockDish} isWantToEat={false} onToggleWantToEat={onToggleWantToEat} />
    )
    const wantButton = screen.getByRole('button', { name: /想吃/ })
    expect(wantButton).toBeInTheDocument()
    expect(wantButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(wantButton)
    expect(onToggleWantToEat).toHaveBeenCalledTimes(1)

    rerender(
      <BrowserRouter>
        <DishDetail dish={mockDish} isWantToEat onToggleWantToEat={onToggleWantToEat} />
      </BrowserRouter>
    )
    const wantButtonActive = screen.getByRole('button', { name: /想吃/ })
    expect(wantButtonActive).toHaveAttribute('aria-pressed', 'true')
  })
})
