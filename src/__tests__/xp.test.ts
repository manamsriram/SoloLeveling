import { xpThreshold, getLevel, getLevelProgress, getRank } from '@/lib/xp'

describe('xpThreshold', () => {
  test('level 1 requires 0 XP', () => expect(xpThreshold(1)).toBe(0))
  test('level 2 requires 1741 XP', () => expect(xpThreshold(2)).toBe(1741))
  test('level 10 requires floor(500 * 10^1.8) XP', () => expect(xpThreshold(10)).toBe(31547))
})

describe('getLevel', () => {
  test('0 XP = level 1', () => expect(getLevel(0)).toBe(1))
  test('1740 XP = level 1', () => expect(getLevel(1740)).toBe(1))
  test('1741 XP = level 2', () => expect(getLevel(1741)).toBe(2))
  test('3611 XP = level 2', () => expect(getLevel(3611)).toBe(2))
  test('3612 XP = level 3', () => expect(getLevel(3612)).toBe(3))
})

describe('getLevelProgress', () => {
  test('returns 0 pct at start of level 2', () => {
    const p = getLevelProgress(1741)
    expect(p.pct).toBe(0)
    expect(p.min).toBe(1741)
  })
  test('returns 0 pct at start of level 3', () => {
    const p = getLevelProgress(3612)
    expect(p.pct).toBe(0)
  })
  test('returns ~50 pct halfway through level 1', () => {
    const p = getLevelProgress(870)
    expect(p.pct).toBeGreaterThan(48)
    expect(p.pct).toBeLessThan(52)
  })
})

describe('getRank', () => {
  test('level 1 = E-Rank', () => expect(getRank(1)).toBe('E-Rank'))
  test('level 9 = E-Rank', () => expect(getRank(9)).toBe('E-Rank'))
  test('level 10 = D-Rank', () => expect(getRank(10)).toBe('D-Rank'))
  test('level 50 = S-Rank', () => expect(getRank(50)).toBe('S-Rank'))
  test('level 100 = Shadow Monarch', () => expect(getRank(100)).toBe('Shadow Monarch'))
})
