'use client'

import { useState, useEffect } from 'react'
import { signInSilently } from '@/lib/firebase'
import { startSync } from '@/lib/sync'
import TodayScreen from '@/components/TodayScreen'
import ProfileScreen from '@/components/ProfileScreen'
import HistoryScreen from '@/components/HistoryScreen'
import ManageScreen from '@/components/ManageScreen'

type Tab = 'today' | 'profile' | 'history' | 'manage'

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '⚔' },
  { id: 'profile', label: 'Hunter', icon: '◈' },
  { id: 'history', label: 'History', icon: '◉' },
  { id: 'manage', label: 'Manage', icon: '✦' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  useEffect(() => {
    let unsub: (() => void) | undefined
    signInSilently()
      .then(() => { unsub = startSync() })
      .catch(console.error)
    return () => { unsub?.() }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'today' && <TodayScreen />}
        {tab === 'profile' && <ProfileScreen />}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'manage' && <ManageScreen />}
      </main>

      <nav style={{
        display: 'flex',
        borderTop: '1px solid #1a1a1a',
        background: 'var(--surface-1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        flexShrink: 0,
      }}>
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: tab === id ? 'var(--gold)' : 'var(--text-dim)',
              fontSize: 18,
              transition: 'color 0.15s',
            }}
          >
            <span>{icon}</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.05em' }}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
