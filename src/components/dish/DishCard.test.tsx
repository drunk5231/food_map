import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DishCard from './DishCard'
import type { Dish } from '../../types'

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
  story: '红烧肉是中国最经典的家常菜之一。',
  history: '起源可追溯至宋代。',
  best_season: 'winter',
  related_solar_terms: [],
  emoji: '🍖',
  description: '色泽红亮、肥而不腻的经典上海红烧肉',
  pairing_drink: '黄酒',
  pairing_side: '清炒时蔬',
  pairing_staple: '米饭',
  created_at: '2024-01-01',
}

describe('DishCard', () => {
  it('renders dish name', () => {
    renderWithProviders(<DishCard dish={mockDish} />)
    expect(screen.getByText('红烧肉')).toBeInTheDocument()
  })

  it('renders dish emoji', () => {
    renderWithProviders(<DishCard dish={mockDish} />)
    expect(screen.getByText('🍖')).toBeInTheDocument()
  })

  it('renders category label', () => {
    renderWithProviders(<DishCard dish={mockDish} />)
    expect(screen.getByText('主菜')).toBeInTheDocument()
  })

  it('renders description', () => {
    renderWithProviders(<DishCard dish={mockDish} />)
    expect(screen.getByText(/色泽红亮/)).toBeInTheDocument()
  })

  it('shows flavor badges', () => {
    renderWithProviders(<DishCard dish={mockDish} />)
    expect(screen.getByText(/辣2/)).toBeInTheDocument()
    expect(screen.getByText(/甜5/)).toBeInTheDocument()
    expect(screen.getByText(/鲜6/)).toBeInTheDocument()
  })

  it('shows difficulty stars', () => {
    renderWithProviders(<DishCard dish={mockDish} />)
    expect(screen.getByText(/⭐⭐⭐/)).toBeInTheDocument()
  })

  it('calls onToggleFavorite when favorite button clicked', () => {
    const onToggleFavorite = vi.fn()
    renderWithProviders(
      <DishCard dish={mockDish} onToggleFavorite={onToggleFavorite} />
    )
    const favButton = screen.getByLabelText('收藏')
    fireEvent.click(favButton)
    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleEaten when eaten button clicked', () => {
    const onToggleEaten = vi.fn()
    renderWithProviders(
      <DishCard dish={mockDish} onToggleEaten={onToggleEaten} />
    )
    const eatenButton = screen.getByLabelText('标记已吃')
    fireEvent.click(eatenButton)
    expect(onToggleEaten).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when card clicked', () => {
    const onClick = vi.fn()
    renderWithProviders(<DishCard dish={mockDish} onClick={onClick} />)
    const card = screen.getByRole('button', { name: '红烧肉' })
    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows correct visual state when isFavorite=true', () => {
    renderWithProviders(
      <DishCard dish={mockDish} isFavorite onToggleFavorite={vi.fn()} />
    )
    expect(screen.getByLabelText('取消收藏')).toBeInTheDocument()
    expect(screen.getByText('❤️')).toBeInTheDocument()
  })

  it('shows correct visual state when isEaten=true', () => {
    renderWithProviders(
      <DishCard dish={mockDish} isEaten onToggleEaten={vi.fn()} />
    )
    expect(screen.getByLabelText('取消已吃')).toBeInTheDocument()
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('keyboard accessibility: Enter key triggers onClick', () => {
    const onClick = vi.fn()
    renderWithProviders(<DishCard dish={mockDish} onClick={onClick} />)
    const card = screen.getByRole('button', { name: '红烧肉' })
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('keyboard accessibility: Space key triggers onClick', () => {
    const onClick = vi.fn()
    renderWithProviders(<DishCard dish={mockDish} onClick={onClick} />)
    const card = screen.getByRole('button', { name: '红烧肉' })
    fireEvent.keyDown(card, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
