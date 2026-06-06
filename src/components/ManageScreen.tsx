'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '@/lib/db'
import { fsSetGoal, fsDeleteGoal, fsSetPerk, fsDeletePerk } from '@/lib/sync'
import type { Goal, Perk, Stat } from '@/lib/types'
import { nanoid } from 'nanoid'

const STATS: Stat[] = ['STR', 'AGI', 'INT', 'VIT']

export default function ManageScreen() {
  const goals = useLiveQuery(() => db.goals.toArray(), [])
  const perks = useLiveQuery(() => db.perks.orderBy('levelRequired').toArray(), [])

  const [goalName, setGoalName] = useState('')
  const [goalXP, setGoalXP] = useState('50')
  const [goalStat, setGoalStat] = useState<Stat>('STR')
  const [perkLevel, setPerkLevel] = useState('')
  const [perkDesc, setPerkDesc] = useState('')
  const [tab, setTab] = useState<'goals' | 'perks'>('goals')

  const addGoal = async () => {
    const name = goalName.trim()
    const xp = parseInt(goalXP, 10)
    if (!name || isNaN(xp) || xp < 1) return
    const goal: Goal = { id: nanoid(), name, xpValue: xp, stat: goalStat, createdAt: new Date().toISOString(), active: true }
    await db.goals.add(goal)
    fsSetGoal(goal).catch(console.error)
    setGoalName('')
    setGoalXP('50')
  }

  const toggleGoalActive = async (goal: Goal) => {
    const updated: Goal = { ...goal, active: !goal.active }
    await db.goals.put(updated)
    fsSetGoal(updated).catch(console.error)
  }

  const deleteGoal = async (id: string) => {
    await db.goals.delete(id)
    fsDeleteGoal(id).catch(console.error)
  }

  const addPerk = async () => {
    const level = parseInt(perkLevel, 10)
    const desc = perkDesc.trim()
    if (isNaN(level) || level < 1 || !desc) return
    const perk: Perk = { id: nanoid(), levelRequired: level, description: desc, unlocked: false }
    await db.perks.add(perk)
    fsSetPerk(perk).catch(console.error)
    setPerkLevel('')
    setPerkDesc('')
  }

  const deletePerk = async (id: string) => {
    await db.perks.delete(id)
    fsDeletePerk(id).catch(console.error)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-3)', border: '1px solid #2a2a2a',
    borderRadius: 'var(--radius-inner)', color: 'var(--text)',
    padding: '10px 12px', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-geist-sans)',
  }

  const btnStyle: React.CSSProperties = {
    background: 'var(--gold)', color: '#000', border: 'none',
    borderRadius: 'var(--radius-inner)', padding: '10px 20px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'var(--font-geist-mono)',
  }

  return (
    <div style={{ padding: '16px 16px 8px', maxWidth: 480, margin: '0 auto' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['goals', 'perks'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-inner)',
              border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--gold)' : 'var(--surface-2)',
              color: tab === t ? '#000' : 'var(--text-dim)',
              fontFamily: 'var(--font-geist-mono)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.05em', textTransform: 'uppercase' as const,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'goals' && (
        <>
          {/* Add goal form */}
          <div style={{
            background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
            padding: 16, marginBottom: 20, border: '1px solid #1e1e1e',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>
              ADD QUEST
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                style={{ ...inputStyle, width: '100%' }}
                placeholder="Quest name"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  min={1}
                  max={500}
                  placeholder="XP"
                  value={goalXP}
                  onChange={(e) => setGoalXP(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  {STATS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setGoalStat(s)}
                      style={{
                        flex: 1, padding: '8px 0',
                        borderRadius: 'var(--radius-inner)',
                        border: `1px solid ${goalStat === s ? 'var(--gold)' : '#2a2a2a'}`,
                        background: goalStat === s ? 'rgba(245,200,66,0.15)' : 'var(--surface-3)',
                        color: goalStat === s ? 'var(--gold)' : 'var(--text-dim)',
                        cursor: 'pointer', fontSize: 12,
                        fontFamily: 'var(--font-geist-mono)', fontWeight: 700,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button style={btnStyle} onClick={addGoal}>+ Add Quest</button>
            </div>
          </div>

          {/* Goal list */}
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
            ALL QUESTS
          </div>
          {goals?.length === 0 && (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24, fontSize: 14 }}>
              No quests yet.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals?.map((goal: Goal) => (
              <div key={goal.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
                padding: '12px 14px', border: '1px solid #1e1e1e',
                opacity: goal.active ? 1 : 0.5,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{goal.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', marginTop: 2 }}>
                    {goal.stat} · +{goal.xpValue} XP
                  </div>
                </div>
                <button
                  onClick={() => toggleGoalActive(goal)}
                  style={{
                    fontSize: 11, padding: '4px 10px',
                    borderRadius: 'var(--radius-inner)',
                    border: `1px solid ${goal.active ? 'var(--gold)' : '#333'}`,
                    background: 'transparent',
                    color: goal.active ? 'var(--gold)' : 'var(--text-dim)',
                    cursor: 'pointer', fontFamily: 'var(--font-geist-mono)',
                  }}
                >
                  {goal.active ? 'Active' : 'Off'}
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  style={{
                    fontSize: 16, padding: '4px 8px',
                    borderRadius: 'var(--radius-inner)',
                    border: 'none', background: 'transparent',
                    color: 'var(--text-dim)', cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'perks' && (
        <>
          {/* Add perk form */}
          <div style={{
            background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
            padding: 16, marginBottom: 20, border: '1px solid #1e1e1e',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>
              ADD MILESTONE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  min={1}
                  placeholder="Level"
                  value={perkLevel}
                  onChange={(e) => setPerkLevel(e.target.value)}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Reward description"
                  value={perkDesc}
                  onChange={(e) => setPerkDesc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPerk()}
                />
              </div>
              <button style={btnStyle} onClick={addPerk}>+ Add Milestone</button>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
            MILESTONES
          </div>
          {perks?.length === 0 && (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24, fontSize: 14 }}>
              No milestones yet. Add personal rewards to unlock at level thresholds.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {perks?.map((perk: Perk) => (
              <div key={perk.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
                padding: '12px 14px', border: '1px solid #1e1e1e',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{perk.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', marginTop: 2 }}>
                    Lv.{perk.levelRequired}
                  </div>
                </div>
                <button
                  onClick={() => deletePerk(perk.id)}
                  style={{
                    fontSize: 16, padding: '4px 8px',
                    borderRadius: 'var(--radius-inner)',
                    border: 'none', background: 'transparent',
                    color: 'var(--text-dim)', cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
