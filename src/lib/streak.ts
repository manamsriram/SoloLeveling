function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getYesterday(asOf: string): string {
  const d = new Date(asOf)
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

function dateDiffDays(earlier: string, later: string): number {
  return Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / 86400000)
}

function countConsecutiveBack(sorted: string[], anchor: string): number {
  let streak = 1
  let prev = anchor
  for (let i = 1; i < sorted.length; i++) {
    if (dateDiffDays(sorted[i], prev) === 1) {
      streak++
      prev = sorted[i]
    } else {
      break
    }
  }
  return streak
}

export function isStreakAlive(completedDates: string[], asOf?: string): boolean {
  if (completedDates.length === 0) return false
  const ref = asOf ?? toDateStr(new Date())
  const sorted = [...completedDates].sort()
  const last = sorted[sorted.length - 1]
  return last === ref || last === getYesterday(ref)
}

export function getGoalStreak(completedDates: string[], referenceDate: string): number {
  if (completedDates.length === 0) return 0
  const unique = Array.from(new Set(completedDates)).sort().reverse()
  const yStr = getYesterday(referenceDate)
  const anchor = unique[0]
  if (anchor !== referenceDate && anchor !== yStr) return 0
  return countConsecutiveBack(unique, anchor)
}

export function getGlobalStreak(completedDays: string[], asOf?: string): number {
  if (completedDays.length === 0) return 0
  const ref = asOf ?? toDateStr(new Date())
  const unique = Array.from(new Set(completedDays)).sort().reverse()
  const anchor = unique[0]
  if (anchor !== ref && anchor !== getYesterday(ref)) return 0
  return countConsecutiveBack(unique, anchor)
}
