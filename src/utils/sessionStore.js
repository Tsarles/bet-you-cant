import { db } from './firebase'
import {
  doc, setDoc, getDoc, updateDoc, onSnapshot
} from 'firebase/firestore'

const COL = 'sessions'

export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = () => chars[Math.floor(Math.random() * chars.length)]
  return `${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}`
}

export async function saveSession(code, data) {
  await setDoc(doc(db, COL, code), { ...data, _ts: Date.now() })
}

export async function loadSession(code) {
  const snap = await getDoc(doc(db, COL, code))
  return snap.exists() ? snap.data() : null
}

export function watchSession(code, callback) {
  return onSnapshot(doc(db, COL, code), snap => {
    if (snap.exists()) callback(snap.data())
  })
}

export async function joinSession(code, guestInfo) {
  const s = await loadSession(code)
  if (!s) return null
  const updated = {
    ...s,
    player2Joined: true,
    players: { ...s.players, O: guestInfo }
  }
  await saveSession(code, updated)
  return updated
}

export async function updateGameState(code, gameState) {
  await updateDoc(doc(db, COL, code), { gameState, _ts: Date.now() })
}

export async function updateScores(code, scores) {
  await updateDoc(doc(db, COL, code), { scores, _ts: Date.now() })
}

export const PLAYER_COLORS = [
  { label: 'Cherry',   value: '#c0392b' },
  { label: 'Ocean',    value: '#2471a3' },
  { label: 'Forest',   value: '#1a6b35' },
  { label: 'Grape',    value: '#7d3c98' },
  { label: 'Flame',    value: '#d35400' },
  { label: 'Teal',     value: '#0e6b6b' },
  { label: 'Crimson',  value: '#a93226' },
  { label: 'Midnight', value: '#2c3e50' },
]

export const DARE_TYPES = [
  { value: 'none',  label: 'No dare / just for fun' },
  { value: 'dare',  label: 'Dare — loser does something embarrassing' },
  { value: 'bet',   label: 'Bet — something is at stake' },
  { value: 'truth', label: 'Truth — loser has to answer honestly' },
]