'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, getOrCreateProfile } from '@/lib/db'
import { getLevel, getLevelProgress, getRank, xpThreshold } from '@/lib/xp'
import type { Perk, Stat } from '@/lib/types'
import { useEffect } from 'react'

const STAT_LABELS: Record<Stat, string> = {
  STR: 'Strength',
  AGI: 'Agility',
  INT: 'Intelligence',
  VIT: 'Vitality',
}

const RANK_INITIALS: Record<string, string> = {
  'E-Rank': 'E',
  'D-Rank': 'D',
  'C-Rank': 'C',
  'B-Rank': 'B',
  'A-Rank': 'A',
  'S-Rank': 'S',
  'National Level Hunter': 'N',
  'Shadow Monarch': '∞',
}

export default function ProfileScreen() {
  const profile = useLiveQuery(() => db.profile.get('local'), [])
  const perks = useLiveQuery(() => db.perks.orderBy('levelRequired').toArray(), [])

  useEffect(() => { getOrCreateProfile() }, [])

  if (!profile) return <div style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center' }}>Loading...</div>

  const level = getLevel(profile.totalXP)
  const rank = getRank(level)
  const progress = getLevelProgress(profile.totalXP)
  const nextThreshold = xpThreshold(level + 1)
  const rankInitial = RANK_INITIALS[rank] ?? 'E'

  return (
    <div style={{ padding: '16px 16px 8px', maxWidth: 480, margin: '0 auto' }}>
      {/* Hunter Card */}
      <div style={{
        background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
        padding: 20, marginBottom: 16,
        border: '1px solid #1e1e1e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '2px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-3)',
            fontSize: 28, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', fontWeight: 700,
          }}>
            {rankInitial}
          </div>
          <div>
            <div style={{ fontSize: 20, color: 'var(--text)', fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', marginTop: 2 }}>
              {rank}
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
              Level {level}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
              {profile.totalXP.toLocaleString()} / {nextThreshold.toLocaleString()} XP
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress.pct}%`,
              background: 'linear-gradient(90deg, var(--gold), #ffd700)',
              borderRadius: 2,
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {profile.currentStreak > 0 && (
            <div style={{ color: 'var(--crimson)', fontSize: 13 }}>
              🔥 <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{profile.currentStreak}d streak</span>
            </div>
          )}
          {profile.longestStreak > 0 && (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
              Best: <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{profile.longestStreak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
        STATS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {(['STR', 'AGI', 'INT', 'VIT'] as Stat[]).map((stat) => (
          <div key={stat} style={{
            background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
            padding: '12px 14px', border: '1px solid #1e1e1e',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em' }}>
              {stat}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{STAT_LABELS[stat]}</div>
            <div style={{ fontSize: 28, color: 'var(--gold)', fontFamily: 'var(--font-geist-mono)', fontWeight: 700, marginTop: 4 }}>
              {profile.stats[stat] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Perks */}
      {perks && perks.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em', marginBottom: 10 }}>
            MILESTONES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {perks.map((perk: Perk) => {
              const levelsAway = perk.levelRequired - level
              const unlocked = level >= perk.levelRequired
              return (
                <div key={perk.id} style={{
                  background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
                  padding: '12px 16px',
                  border: `1px solid ${unlocked ? 'var(--gold)' : '#1e1e1e'}`,
                  opacity: unlocked ? 1 : 0.6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: unlocked ? 'var(--text)' : 'var(--text-dim)' }}>
                      {perk.description}
                    </span>
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--font-geist-mono)',
                      color: unlocked ? 'var(--gold)' : 'var(--text-dim)',
                      marginLeft: 12, whiteSpace: 'nowrap',
                    }}>
                      {unlocked ? '✓ Lv.' + perk.levelRequired : `Lv.${perk.levelRequired}`}
                    </span>
                  </div>
                  {!unlocked && levelsAway <= 10 && (
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                      {levelsAway} level{levelsAway !== 1 ? 's' : ''} away
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
