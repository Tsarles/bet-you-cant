import { useState, useEffect, useCallback } from 'react'
import { watchSession, updateGameState as persistState, saveSession, loadSession } from '../utils/sessionStore'

export default function useGameSession(code, playerRole) {
  const [session, setSession] = useState(null)

  // Real-time listener — fires instantly when any player makes a move
  useEffect(() => {
    if (!code) return
    const unsub = watchSession(code, (data) => {
      setSession(data)
    })
    return () => unsub()
  }, [code])

  const updateGameState = useCallback(async (newGameState) => {
    await persistState(code, newGameState)
  }, [code])

  const markJoined = useCallback(async () => {
    const current = await loadSession(code)
    if (!current) return
    await saveSession(code, { ...current, player2Joined: true })
  }, [code])

  return { session, updateGameState, markJoined }
}