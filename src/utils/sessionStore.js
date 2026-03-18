// utils/sessionStore.js — localStorage session helpers

const PREFIX = 'byc_'

export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = () => chars[Math.floor(Math.random() * chars.length)]
  return `${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}`
}

export function saveSession(code, data) {
  try { localStorage.setItem(PREFIX + code, JSON.stringify({ ...data, _ts: Date.now() })) }
  catch {}
}

export function loadSession(code) {
  try { const r = localStorage.getItem(PREFIX + code); return r ? JSON.parse(r) : null }
  catch { return null }
}

export function deleteSession(code) {
  try { localStorage.removeItem(PREFIX + code) } catch {}
}

/** Guest joins — marks player2Joined and saves their player info */
export function joinSession(code, guestInfo) {
  const s = loadSession(code)
  if (!s) return null
  const updated = {
    ...s,
    player2Joined: true,
    players: { ...s.players, O: guestInfo },
  }
  saveSession(code, updated)
  return updated
}

/** Update only the gameState (for move sync) */
export function updateGameState(code, gameState) {
  const s = loadSession(code)
  if (!s) return
  saveSession(code, { ...s, gameState })
}

/** Update scores after a round ends */
export function updateScores(code, scores) {
  const s = loadSession(code)
  if (!s) return
  saveSession(code, { ...s, scores })
}

/** Default player colors */
export const PLAYER_COLORS = [
  { label: 'Cherry',    value: '#c0392b' },
  { label: 'Ocean',     value: '#2471a3' },
  { label: 'Forest',    value: '#1a6b35' },
  { label: 'Grape',     value: '#7d3c98' },
  { label: 'Flame',     value: '#d35400' },
  { label: 'Teal',      value: '#0e6b6b' },
  { label: 'Crimson',   value: '#a93226' },
  { label: 'Midnight',  value: '#2c3e50' },
]

export const DARE_TYPES = [
  { value: 'none',  label: 'No dare / just for fun' },
  { value: 'dare',  label: 'Dare — loser does something embarrassing' },
  { value: 'bet',   label: 'Bet — something is at stake' },
  { value: 'truth', label: 'Truth — loser has to answer honestly' },
]
