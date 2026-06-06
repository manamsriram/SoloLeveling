import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { firestore, isConfigured } from './firebase'
import { db } from './db'
import type { Goal, Completion, Profile, Perk } from './types'

export function startSync(): () => void {
  if (!isConfigured) return () => {}

  const unsubs: Array<() => void> = []

  unsubs.push(
    onSnapshot(collection(firestore, 'goals'), (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'removed') {
          await db.goals.delete(change.doc.id)
        } else {
          await db.goals.put(change.doc.data() as Goal)
        }
      })
    })
  )

  unsubs.push(
    onSnapshot(collection(firestore, 'completions'), (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'removed') {
          await db.completions.delete(change.doc.id)
        } else {
          await db.completions.put(change.doc.data() as Completion)
        }
      })
    })
  )

  unsubs.push(
    onSnapshot(collection(firestore, 'perks'), (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'removed') {
          await db.perks.delete(change.doc.id)
        } else {
          await db.perks.put(change.doc.data() as Perk)
        }
      })
    })
  )

  unsubs.push(
    onSnapshot(doc(firestore, 'profile', 'local'), async (snap) => {
      if (snap.exists()) {
        await db.profile.put(snap.data() as Profile)
      }
    })
  )

  return () => unsubs.forEach((u) => u())
}

export async function fsSetGoal(goal: Goal): Promise<void> {
  if (!isConfigured) return
  await setDoc(doc(firestore, 'goals', goal.id), goal)
}

export async function fsDeleteGoal(id: string): Promise<void> {
  if (!isConfigured) return
  await deleteDoc(doc(firestore, 'goals', id))
}

export async function fsSetCompletion(completion: Completion): Promise<void> {
  if (!isConfigured) return
  await setDoc(doc(firestore, 'completions', completion.id), completion)
}

export async function fsDeleteCompletion(id: string): Promise<void> {
  if (!isConfigured) return
  await deleteDoc(doc(firestore, 'completions', id))
}

export async function fsSetProfile(profile: Profile): Promise<void> {
  if (!isConfigured) return
  await setDoc(doc(firestore, 'profile', 'local'), profile)
}

export async function fsSetPerk(perk: Perk): Promise<void> {
  if (!isConfigured) return
  await setDoc(doc(firestore, 'perks', perk.id), perk)
}

export async function fsDeletePerk(id: string): Promise<void> {
  if (!isConfigured) return
  await deleteDoc(doc(firestore, 'perks', id))
}
