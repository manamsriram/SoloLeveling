'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getGoalStreak, getGlobalStreak } from '@/lib/streak'
import type { Goal, Completion } from '@/lib/types'

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function buildCalendarDays(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(toDateStr(d))
  }
  return days
}

export default function HistoryScreen() {
  const today = toDateStr(new Date())
  const goals = useLiveQuery(async () => {
    const all = await db.goals.toArray()
    return all.filter((g) => g.active)
  }, [])
  const allCompletions = useLiveQuery(() => db.completions.toArray(), [])

  if (!goals || !allCompletions) {
    return <div style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center' }}>Loading...</div>
  }

  const totalGoals = goals.length

  const completionsByDate = allCompletions.reduce((acc: Record<string, number>, c: Completion) => {
    acc[c.date] = (acc[c.date] ?? 0) + 1
    return acc
  }, {})

  const allDates = Array.from(new Set(allCompletions.map((c: Completion) => c.date)))
  const fullDays = allDates.filter((d) => (completionsByDate[d] ?? 0) >= totalGoals && totalGoals > 0)
  const globalStreak = getGlobalStreak(fullDays, today)

  const longestStreak = (() => {
    if (fullDays.length === 0) return 0
    const sorted = [...fullDays].sort()
    let max = 1, cur = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
      if (diff === 1) { cur++; max = Math.max(max, cur) }
      else cur = 1
    }
    return max
  })()

  const calDays = buildCalendarDays()

  return (
    <div style={{ padding: '16px 16px 8px', maxWidth: 480, margin: '0 auto' }}>
      {/* Global streak */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20,
      }}>
        <div style={{
          flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
          padding: '12px 16px', border: '1px solid #1e1e1e',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em' }}>CURRENT</div>
          <div style={{ fontSize: 32, color: 'var(--crimson)', fontFamily: 'var(--font-geist-mono)', fontWeight: 700 }}>
            {globalStreak}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>day streak</div>
        </div>
        <div style={{
          flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
          padding: '12px 16px', border: '1px solid #1e1e1e',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em' }}>LONGEST</div>
          <div style={{ fontSize: 32, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', fontWeight: 700 }}>
            {longestStreak}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>day streak</div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
        ACTIVITY — LAST 12 WEEKS
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 3,
        marginBottom: 20,
      }}>
        {calDays.map((date) => {
          const count = completionsByDate[date] ?? 0
          const full = totalGoals > 0 && count >= totalGoals
          const partial = count > 0 && !full
          return (
            <div
              key={date}
              title={`${date}: ${count} completed`}
              style={{
                aspectRatio: '1',
                borderRadius: 2,
                background: full
                  ? 'var(--gold)'
                  : partial
                  ? 'var(--crimson)'
                  : 'var(--surface-3)',
                opacity: full ? 1 : partial ? 0.6 : 0.3,
              }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 11, color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gold)' }} />
          All done
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--crimson)', opacity: 0.6 }} />
          Partial
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface-3)', opacity: 0.3 }} />
          None
        </div>
      </div>

      {/* Per-goal streaks */}
      {goals.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
            GOAL STREAKS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {goals.map((goal: Goal) => {
              const dates = allCompletions
                .filter((c: Completion) => c.goalId === goal.id)
                .map((c: Completion) => c.date)
              const streak = getGoalStreak(dates, today)
              return (
                <div key={goal.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
                  padding: '10px 14px', border: '1px solid #1e1e1e',
                }}>
                  <span style={{ fontSize: 14, color: 'var(--text)' }}>{goal.name}</span>
                  <span style={{
                    fontSize: 16, fontFamily: 'var(--font-geist-mono)', fontWeight: 700,
                    color: streak > 0 ? 'var(--crimson)' : 'var(--text-dim)',
                  }}>
                    {streak > 0 ? `🔥${streak}` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
