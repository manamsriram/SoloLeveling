import type { Rank } from './types'

export function xpThreshold(level: number): number {
  if (level <= 1) return 0
  return Math.floor(500 * Math.pow(level, 1.8))
}

export function getLevel(totalXP: number): number {
  let level = 1
  while (xpThreshold(level + 1) <= totalXP) level++
  return level
}

export function getLevelProgress(totalXP: number): {
  pct: number
  current: number
  min: number
  max: number
} {
  const level = getLevel(totalXP)
  const min = xpThreshold(level)
  const max = xpThreshold(level + 1)
  const current = totalXP - min
  return { pct: Math.round((current / (max - min)) * 100), current, min, max }
}

const RANK_MAP: [number, Rank][] = [
  [100, 'Shadow Monarch'],
  [75, 'National Level Hunter'],
  [50, 'S-Rank'],
  [40, 'A-Rank'],
  [30, 'B-Rank'],
  [20, 'C-Rank'],
  [10, 'D-Rank'],
  [1, 'E-Rank'],
]

export function getRank(level: number): Rank {
  for (const [threshold, rank] of RANK_MAP) {
    if (level >= threshold) return rank
  }
  return 'E-Rank'
}
