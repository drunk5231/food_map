import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import FlavorRadar from './FlavorRadar'
import type { FlavorProfile } from '../../types'

const mockProfile: FlavorProfile = {
  spicy: 8, sweet: 2, sour: 3, salty: 5, umami: 6, numbing: 7, bitter: 1, aromatic: 4,
}

describe('FlavorRadar', () => {
  it('renders correctly with a flavor profile', () => {
    const { container } = render(<FlavorRadar flavors={mockProfile} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    // The component uses path elements for the data area (not polygon)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(1)
    // Check that data point circles exist (one per flavor dimension)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(8)
  })

  it('renders comparison overlay when compareWith is provided', () => {
    const prevProfile: FlavorProfile = { spicy: 3, sweet: 5, sour: 1, salty: 7, umami: 4, numbing: 2, bitter: 0, aromatic: 6 }
    const { container } = render(<FlavorRadar flavors={mockProfile} compareWith={prevProfile} />)
    const paths = container.querySelectorAll('path')
    // Should have at least 2 path elements: main data area + comparison overlay
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('handles all-zero profile', () => {
    const zeroProfile: FlavorProfile = { spicy: 0, sweet: 0, sour: 0, salty: 0, umami: 0, numbing: 0, bitter: 0, aromatic: 0 }
    const { container } = render(<FlavorRadar flavors={zeroProfile} />)
    expect(container.querySelector('svg')).toBeTruthy()
    // All circles should still exist at center position
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(8)
  })

  it('handles all-max profile', () => {
    const maxProfile: FlavorProfile = { spicy: 10, sweet: 10, sour: 10, salty: 10, umami: 10, numbing: 10, bitter: 10, aromatic: 10 }
    const { container } = render(<FlavorRadar flavors={maxProfile} />)
    expect(container.querySelector('svg')).toBeTruthy()
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(8)
  })

  it('has proper accessibility attributes', () => {
    const { container } = render(<FlavorRadar flavors={mockProfile} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('role')).toBe('img')
    expect(svg?.getAttribute('aria-label')).toBeTruthy()
  })

  it('renders flavor labels by default', () => {
    const { container } = render(<FlavorRadar flavors={mockProfile} />)
    const texts = container.querySelectorAll('text')
    // Should have 8 text labels, each containing a flavor label and a tspan with value
    expect(texts.length).toBe(8)
  })

  it('hides labels when showLabels is false', () => {
    const { container } = render(<FlavorRadar flavors={mockProfile} showLabels={false} />)
    const texts = container.querySelectorAll('text')
    expect(texts.length).toBe(0)
  })

  it('renders grid polygons', () => {
    const { container } = render(<FlavorRadar flavors={mockProfile} />)
    const polygons = container.querySelectorAll('polygon')
    // The component renders 5 grid level polygons (2, 4, 6, 8, 10)
    expect(polygons.length).toBe(5)
  })

  it('matches snapshot with standard profile', () => {
    const { container } = render(<FlavorRadar flavors={mockProfile} />)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('matches snapshot with comparison overlay', () => {
    const prevProfile: FlavorProfile = { spicy: 3, sweet: 5, sour: 1, salty: 7, umami: 4, numbing: 2, bitter: 0, aromatic: 6 }
    const { container } = render(<FlavorRadar flavors={mockProfile} compareWith={prevProfile} />)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('matches snapshot with all-zero profile', () => {
    const zeroProfile: FlavorProfile = { spicy: 0, sweet: 0, sour: 0, salty: 0, umami: 0, numbing: 0, bitter: 0, aromatic: 0 }
    const { container } = render(<FlavorRadar flavors={zeroProfile} />)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('matches snapshot with all-max profile', () => {
    const maxProfile: FlavorProfile = { spicy: 10, sweet: 10, sour: 10, salty: 10, umami: 10, numbing: 10, bitter: 10, aromatic: 10 }
    const { container } = render(<FlavorRadar flavors={maxProfile} />)
    expect(container.innerHTML).toMatchSnapshot()
  })
})
