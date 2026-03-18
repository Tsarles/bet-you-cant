// hooks/useGameSession.js
// Real-time Firebase listener — fires instantly when any player
// writes to the session document. No polling needed.

import { useState, useEffect, useCallback } from 'react'
import {
  watchSession,
  updateGameState as persistState,
  loadSession,
  saveSession,
} from '../utils/sessionStore'

export default function useGameSession(code, playerRole) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    if (!code) return

    setLoading(true)
    const unsub = watchSession(code, (data) => {
      setSession(data)
      setLoading(false)
    })

    return () => unsub()
  }, [code])

  // Push a new game state to Firebase (triggers watchSession on both clients)
  const updateGameState = useCallback(async (newGameState) => {
    try {
      await persistState(code, newGameState)
    } catch (err) {
      console.error('updateGameState failed:', err)
    }
  }, [code])

  // Mark player2 as joined
  const markJoined = useCallback(async () => {
    try {
      const current = await loadSession(code)
      if (!current) return
      await saveSession(code, { ...current, player2Joined: true })
    } catch (err) {
      console.error('markJoined failed:', err)
    }
  }, [code])

  return { session, loading, updateGameState, markJoined }
}
