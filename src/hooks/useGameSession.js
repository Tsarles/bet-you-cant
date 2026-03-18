import { useState, useEffect, useCallback, useRef } from 'react'
import { loadSession, saveSession, updateGameState as persistGameState } from '../utils/sessionStore'

export default function useGameSession(code, playerRole) {
  const [session, setSession] = useState(() => loadSession(code))
  const lastTs = useRef(session?._ts ?? 0)

  useEffect(() => {
    if (!code) return
    const interval = setInterval(() => {
      const fresh = loadSession(code)
      if (fresh && fresh._ts !== lastTs.current) {
        lastTs.current = fresh._ts
        setSession(fresh)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [code])

  const updateGameState = useCallback((newGameState) => {
    persistGameState(code, newGameState)
    const fresh = loadSession(code)
    if (fresh) { lastTs.current = fresh._ts; setSession(fresh) }
  }, [code])

  const markJoined = useCallback(() => {
    const current = loadSession(code)
    if (!current) return
    const updated = { ...current, player2Joined: true }
    saveSession(code, updated)
    lastTs.current = updated._ts
    setSession(updated)
  }, [code])

  return { session, updateGameState, markJoined }
}
