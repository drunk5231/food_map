import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const includeBar = false
    expect(cn('foo', includeBar && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('merges tailwind classes correctly (later wins)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })
})
