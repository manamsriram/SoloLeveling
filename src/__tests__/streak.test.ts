import { getGoalStreak, getGlobalStreak, isStreakAlive } from '@/lib/streak'

const BASE = '2026-06-05'

const day = (offset: number): string => {
  const d = new Date(BASE)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

describe('isStreakAlive', () => {
  test('alive when completed today', () => expect(isStreakAlive([day(0)], BASE)).toBe(true))
  test('alive when completed yesterday', () => expect(isStreakAlive([day(-1)], BASE)).toBe(true))
  test('dead when last completion was 2 days ago', () => expect(isStreakAlive([day(-2)], BASE)).toBe(false))
  test('dead when no completions', () => expect(isStreakAlive([], BASE)).toBe(false))
})

describe('getGoalStreak', () => {
  test('0 when no completions', () => expect(getGoalStreak([], day(0))).toBe(0))
  test('1 when only today', () => expect(getGoalStreak([day(0)], day(0))).toBe(1))
  test('3 consecutive days', () =>
    expect(getGoalStreak([day(-2), day(-1), day(0)], day(0))).toBe(3))
  test('breaks on gap', () =>
    expect(getGoalStreak([day(-4), day(-3), day(-1), day(0)], day(0))).toBe(2))
  test('counts from yesterday if not done today', () =>
    expect(getGoalStreak([day(-2), day(-1)], day(0))).toBe(2))
  test('0 when last completion older than yesterday', () =>
    expect(getGoalStreak([day(-3), day(-2)], day(0))).toBe(0))
})

describe('getGlobalStreak', () => {
  test('0 when no days', () => expect(getGlobalStreak([], BASE)).toBe(0))
  test('1 for single day', () => expect(getGlobalStreak([day(0)], BASE)).toBe(1))
  test('counts consecutive days ending today', () =>
    expect(getGlobalStreak([day(-2), day(-1), day(0)], BASE)).toBe(3))
  test('counts consecutive days ending yesterday', () =>
    expect(getGlobalStreak([day(-3), day(-2), day(-1)], BASE)).toBe(3))
  test('breaks on gap', () =>
    expect(getGlobalStreak([day(-5), day(-4), day(-1), day(0)], BASE)).toBe(2))
  test('0 when last day older than yesterday', () =>
    expect(getGlobalStreak([day(-5), day(-4)], BASE)).toBe(0))
})
