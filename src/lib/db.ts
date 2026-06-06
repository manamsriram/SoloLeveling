import Dexie, { type Table } from 'dexie'
import type { Goal, Completion, Profile, Perk } from './types'

export class SoloLevelingDB extends Dexie {
  goals!: Table<Goal, string>
  completions!: Table<Completion, string>
  profile!: Table<Profile, string>
  perks!: Table<Perk, string>

  constructor() {
    super('SoloLevelingDB')
    this.version(1).stores({
      goals: 'id, active, stat',
      completions: 'id, goalId, date, [goalId+date]',
      profile: 'id',
      perks: 'id, levelRequired, unlocked',
    })
  }
}

export const db = new SoloLevelingDB()

export async function getOrCreateProfile(): Promise<Profile> {
  let profile = await db.profile.get('local')
  if (!profile) {
    profile = {
      id: 'local',
      name: 'Hunter',
      totalXP: 0,
      level: 1,
      stats: { STR: 0, AGI: 0, INT: 0, VIT: 0 },
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: '',
    }
    await db.profile.put(profile)
  }
  return profile
}

export async function getCompletionsForDate(date: string): Promise<Completion[]> {
  return db.completions.where('date').equals(date).toArray()
}

export async function getCompletionDatesForGoal(goalId: string): Promise<string[]> {
  const completions = await db.completions.where('goalId').equals(goalId).toArray()
  return completions.map((c) => c.date)
}

export async function getAllCompletionDates(): Promise<string[]> {
  const completions = await db.completions.toArray()
  return Array.from(new Set(completions.map((c) => c.date)))
}
