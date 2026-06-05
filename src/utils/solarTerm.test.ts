import { describe, it, expect } from 'vitest'
import { getCurrentSolarTerm } from './solarTerm'
import { getCurrentTimeSlot, getTimeSlotInfo, ALL_TIME_SLOTS } from './timeSlot'

describe('getCurrentSolarTerm', () => {
  it('returns a spring term in March', () => {
    const term = getCurrentSolarTerm(new Date(2024, 2, 15)) // March 15
    expect(term).not.toBeNull()
    expect(term!.season).toBe('spring')
  })

  it('returns a summer term in July', () => {
    const term = getCurrentSolarTerm(new Date(2024, 6, 15)) // July 15
    expect(term).not.toBeNull()
    expect(term!.season).toBe('summer')
  })

  it('returns an autumn term in September', () => {
    const term = getCurrentSolarTerm(new Date(2024, 8, 15)) // September 15
    expect(term).not.toBeNull()
    expect(term!.season).toBe('autumn')
  })

  it('returns a winter term in December', () => {
    const term = getCurrentSolarTerm(new Date(2024, 11, 15)) // December 15
    expect(term).not.toBeNull()
    expect(term!.season).toBe('winter')
  })

  it('handles first day of year (Jan 1)', () => {
    const term = getCurrentSolarTerm(new Date(2024, 0, 1))
    expect(term).not.toBeNull()
    // Jan 1 is before the first solar term (lichun, Feb 4), so it wraps to last term (dongzhi, Dec 22)
    expect(term!.id).toBe('dongzhi')
  })

  it('handles last day of year (Dec 31)', () => {
    const term = getCurrentSolarTerm(new Date(2024, 11, 31))
    expect(term).not.toBeNull()
    expect(term!.season).toBe('winter')
  })

  it('matches lichun on Feb 4', () => {
    const term = getCurrentSolarTerm(new Date(2024, 1, 4))
    expect(term).not.toBeNull()
    expect(term!.id).toBe('lichun')
  })

  it('matches the day before lichun (Feb 3) to dahan', () => {
    const term = getCurrentSolarTerm(new Date(2024, 1, 3))
    expect(term).not.toBeNull()
    expect(term!.id).toBe('dahan')
  })

  it('returns non-null for any date', () => {
    // Test a range of dates across the year
    for (let month = 0; month < 12; month++) {
      const term = getCurrentSolarTerm(new Date(2024, month, 15))
      expect(term).not.toBeNull()
    }
  })
})

describe('getCurrentTimeSlot', () => {
  it('returns breakfast at 7am', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 7, 0))
    expect(info.slot).toBe('breakfast')
    expect(info.label).toBe('早餐')
  })

  it('returns lunch at 12pm', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 12, 0))
    expect(info.slot).toBe('lunch')
    expect(info.label).toBe('午餐')
  })

  it('returns dinner at 18pm', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 18, 0))
    expect(info.slot).toBe('dinner')
    expect(info.label).toBe('晚餐')
  })

  it('returns late_night at midnight (0am)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 0, 0))
    expect(info.slot).toBe('late_night')
    expect(info.label).toBe('深夜食堂')
  })

  it('returns late_night at 3am', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 3, 0))
    expect(info.slot).toBe('late_night')
  })

  it('returns breakfast at 6am (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 6, 0))
    expect(info.slot).toBe('breakfast')
  })

  it('returns morning_tea at 9am (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 9, 0))
    expect(info.slot).toBe('morning_tea')
  })

  it('returns lunch at 11am (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 11, 0))
    expect(info.slot).toBe('lunch')
  })

  it('returns afternoon at 1pm (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 13, 0))
    expect(info.slot).toBe('afternoon')
  })

  it('returns dinner at 4pm (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 16, 0))
    expect(info.slot).toBe('dinner')
  })

  it('returns supper at 7pm (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 19, 0))
    expect(info.slot).toBe('supper')
  })

  it('returns late_night at 10pm (boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 22, 0))
    expect(info.slot).toBe('late_night')
  })

  it('returns supper at 9:59pm (just before boundary)', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 21, 59))
    expect(info.slot).toBe('supper')
  })

  it('includes all required fields', () => {
    const info = getCurrentTimeSlot(new Date(2024, 0, 1, 12, 0))
    expect(info.slot).toBeDefined()
    expect(info.label).toBeDefined()
    expect(info.icon).toBeDefined()
    expect(info.description).toBeDefined()
    expect(info.detailedDescription).toBeDefined()
    expect(info.cookingMethods).toBeInstanceOf(Array)
    expect(info.healthTip).toBeDefined()
    expect(info.themeColor).toBeDefined()
  })
})

describe('getTimeSlotInfo', () => {
  it('returns correct info for each time slot', () => {
    for (const slot of ALL_TIME_SLOTS) {
      const info = getTimeSlotInfo(slot)
      expect(info.slot).toBe(slot)
      expect(info.label).toBeTruthy()
      expect(info.icon).toBeTruthy()
      expect(info.description).toBeTruthy()
      expect(info.cookingMethods).toBeInstanceOf(Array)
      expect(info.cookingMethods.length).toBeGreaterThan(0)
    }
  })

  it('returns breakfast info', () => {
    const info = getTimeSlotInfo('breakfast')
    expect(info.slot).toBe('breakfast')
    expect(info.label).toBe('早餐')
    expect(info.icon).toBe('🌅')
  })

  it('returns lunch info', () => {
    const info = getTimeSlotInfo('lunch')
    expect(info.slot).toBe('lunch')
    expect(info.label).toBe('午餐')
  })

  it('returns dinner info', () => {
    const info = getTimeSlotInfo('dinner')
    expect(info.slot).toBe('dinner')
    expect(info.label).toBe('晚餐')
  })

  it('returns late_night info', () => {
    const info = getTimeSlotInfo('late_night')
    expect(info.slot).toBe('late_night')
    expect(info.label).toBe('深夜食堂')
  })
})
