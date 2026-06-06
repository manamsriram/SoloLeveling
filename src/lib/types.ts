export type Stat = 'STR' | 'AGI' | 'INT' | 'VIT'
export type Rank =
  | 'E-Rank'
  | 'D-Rank'
  | 'C-Rank'
  | 'B-Rank'
  | 'A-Rank'
  | 'S-Rank'
  | 'National Level Hunter'
  | 'Shadow Monarch'

export interface Goal {
  id: string
  name: string
  xpValue: number
  stat: Stat
  createdAt: string
  active: boolean
}

export interface Completion {
  id: string
  goalId: string
  date: string        // YYYY-MM-DD
  completedAt: string // ISO timestamp
}

export interface Profile {
  id: 'local'
  name: string
  totalXP: number
  level: number
  stats: Record<Stat, number>
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string // YYYY-MM-DD
}

export interface Perk {
  id: string
  levelRequired: number
  description: string
  unlocked: boolean
}
