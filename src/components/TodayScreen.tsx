'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { useState, useEffect } from 'react'
import { db, getOrCreateProfile } from '@/lib/db'
import { getLevel, getLevelProgress, getRank, xpThreshold } from '@/lib/xp'
import { getGlobalStreak } from '@/lib/streak'
import type { Goal, Completion } from '@/lib/types'
import { nanoid } from 'nanoid'

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function TodayScreen() {
  const today = toDateStr(new Date())

  const goals = useLiveQuery(async () => {
    const all = await db.goals.toArray()
    return all.filter((g) => g.active)
  }, [])
  const completions = useLiveQuery(
    () => db.completions.where('date').equals(today).toArray(),
    [today]
  )
  const profile = useLiveQuery(() => db.profile.get('local'), [])
  const allDates = useLiveQuery(
    async () => {
      const all = await db.completions.toArray()
      return Array.from(new Set(all.map((c) => c.date)))
    },
    []
  )

  const [levelUpAnim, setLevelUpAnim] = useState(false)

  useEffect(() => {
    getOrCreateProfile()
  }, [])

  if (!goals || !completions || !profile) {
    return <div style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center' }}>Loading...</div>
  }

  const completedIds = new Set(completions.map((c: Completion) => c.goalId))
  const totalXP = profile.totalXP
  const level = getLevel(totalXP)
  const rank = getRank(level)
  const progress = getLevelProgress(totalXP)
  const pct = progress.pct
  const streak = getGlobalStreak(allDates ?? [], today)
  const todayXP = completions.reduce((sum: number, c: Completion) => {
    const goal = goals.find((g: Goal) => g.id === c.goalId)
    return sum + (goal?.xpValue ?? 0)
  }, 0)

  const toggleGoal = async (goal: Goal) => {
    const existing = completions.find((c: Completion) => c.goalId === goal.id)
    if (existing) {
      await db.completions.delete(existing.id)
      await db.profile.update('local', {
        totalXP: Math.max(0, profile.totalXP - goal.xpValue),
      })
    } else {
      const prevLevel = level
      const newXP = profile.totalXP + goal.xpValue
      const newLevel = getLevel(newXP)
      const now = new Date().toISOString()
      await db.completions.add({ id: nanoid(), goalId: goal.id, date: today, completedAt: now })
      const statUpdate = { [`stats.${goal.stat}`]: (profile.stats[goal.stat] ?? 0) + 1 }
      await db.profile.update('local', {
        totalXP: newXP,
        level: newLevel,
        ...statUpdate,
      })
      if (newLevel > prevLevel) {
        setLevelUpAnim(true)
        setTimeout(() => setLevelUpAnim(false), 2000)
      }
    }
  }

  return (
    <div style={{ padding: '16px 16px 8px', maxWidth: 480, margin: '0 auto' }}>
      {levelUpAnim && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,10,10,0.85)',
          animation: 'fadeOut 2s forwards',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', fontWeight: 700 }}>
              LEVEL UP
            </div>
            <div style={{ fontSize: 24, color: 'var(--text)', marginTop: 8 }}>
              Level {level}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em' }}>
            {today}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
            {rank}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--crimson)', fontSize: 13 }}>
              <span>🔥</span>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontWeight: 700 }}>{streak}</span>
            </div>
          )}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--gold)',
            borderRadius: 'var(--radius-card)', padding: '4px 12px',
            color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', fontWeight: 700, fontSize: 18,
          }}>
            Lv.{level}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
            XP {totalXP.toLocaleString()}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
            {xpThreshold(level + 1).toLocaleString()} /{pct}%
          </span>
        </div>
        <div style={{
          height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--gold), #ffd700)',
            borderRadius: 3, transition: 'width 0.4s ease',
          }} />
        </div>
        {todayXP > 0 && (
          <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', marginTop: 4 }}>
            +{todayXP} XP today
          </div>
        )}
      </div>

      {/* Quest List */}
      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
        DAILY QUESTS — {completedIds.size}/{goals.length}
      </div>

      {goals.length === 0 && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
          padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14,
        }}>
          No quests yet. Add goals in Manage.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.map((goal: Goal) => {
          const done = completedIds.has(goal.id)
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--surface-2)',
                border: 'none',
                borderLeft: `3px solid ${done ? 'var(--gold)' : 'var(--crimson)'}`,
                borderRadius: 'var(--radius-card)',
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'opacity 0.15s',
                opacity: done ? 0.7 : 1,
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 'var(--radius-inner)',
                border: `2px solid ${done ? 'var(--gold)' : 'var(--text-dim)'}`,
                background: done ? 'var(--gold)' : 'transparent',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done && <span style={{ color: '#000', fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: done ? 'var(--text-dim)' : 'var(--text)',
                  textDecoration: done ? 'line-through' : 'none',
                  fontSize: 15,
                }}>
                  {goal.name}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text-dim)',
                  fontFamily: 'var(--font-geist-mono)', marginTop: 2,
                }}>
                  {goal.stat} · +{goal.xpValue} XP
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  )
}
