// pages/GameRoom.jsx — async Firebase, anti-leave guard

import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import useGameSession from '../hooks/useGameSession'
import { getGame } from '../games'
import DareBet   from '../components/DareBet'
import GameCode  from '../components/GameCode'
import { loadSession, saveSession, updateScores } from '../utils/sessionStore'
import './GameRoom.css'

export default function GameRoom() {
  const { gameId: code } = useParams()
  const [params]         = useSearchParams()
  const navigate         = useNavigate()
  const lobbyRole        = params.get('role') || 'host'
  const playerRole       = lobbyRole === 'host' ? 'X' : 'O'

  const { session, loading, updateGameState } = useGameSession(code, playerRole)

  const gameActiveRef = useRef(false)
  const [leavePrompt, setLeavePrompt] = useState(false)
  const [pendingNav,  setPendingNav]  = useState(null)

  useEffect(() => {
    if (session && !session.seriesWinner) gameActiveRef.current = true
    if (session?.seriesWinner)            gameActiveRef.current = false
  }, [session])

  useEffect(() => {
    function onBeforeUnload(e) {
      if (gameActiveRef.current) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  function handleLeaveAttempt(dest) {
    if (gameActiveRef.current) { setLeavePrompt(true); setPendingNav(dest) }
    else navigate(dest)
  }

  function confirmLeave() {
    gameActiveRef.current = false
    setLeavePrompt(false)
    navigate(pendingNav || '/home')
  }

  async function handleRoundWin(winner) {
    const current = session?.scores || { X:0, O:0 }
    const winTarget = session?.winTarget || 3
    const newScores = { ...current, [winner]: (current[winner] || 0) + 1 }
    try {
      await updateScores(code, newScores)
      if (newScores[winner] >= winTarget) {
        const s = await loadSession(code)
        if (s) await saveSession(code, { ...s, scores: newScores, seriesWinner: winner })
      }
    } catch (err) {
      console.error('handleRoundWin failed:', err)
    }
  }

  if (loading || !session) return (
    <div className="room room--loading">
      <i className="bx bx-loader-alt bx-spin" style={{fontSize:'2rem',color:'var(--green-muted)'}} />
      <p>Loading game...</p>
    </div>
  )

  const game    = getGame(session.gameId)
  if (!game) return (
    <div className="room room--loading">
      <p>Unknown game.</p>
      <button className="btn btn-ghost" onClick={() => navigate('/home')}>Home</button>
    </div>
  )

  const GameComponent = game.component
  const scores        = session.scores  || { X:0, O:0 }
  const winTarget     = session.winTarget || 3
  const players       = session.players || {
    X: { name:'Player 1', color:'#c0392b' },
    O: { name:'Player 2', color:'#2471a3' },
  }

  return (
    <div className="room">
      {leavePrompt && (
        <div className="leave-overlay">
          <div className="leave-modal card">
            <i className="bx bx-error-circle" style={{fontSize:'2.2rem',color:'var(--red-ink)'}} />
            <h3 className="leave-modal__title">Wait — game is still on!</h3>
            <p className="leave-modal__text">
              Leaving now will forfeit the game. Your friend will see you as disconnected.
            </p>
            <div className="leave-modal__actions">
              <button className="btn btn-secondary" onClick={() => setLeavePrompt(false)}>
                <i className="bx bx-arrow-back" /> Stay
              </button>
              <button
                className="btn btn-ghost"
                style={{color:'var(--red-ink)',borderColor:'var(--red-ink)'}}
                onClick={confirmLeave}
              >
                <i className="bx bx-exit" /> Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="room__sidebar animate-up">
        <button className="btn btn-ghost room-back" onClick={() => handleLeaveAttempt('/home')}>
          <i className="bx bx-arrow-back" /> Home
        </button>

        <div className="room__game-header">
          <div className="room__game-icon"><i className={`bx ${game.bxIcon}`} /></div>
          <div>
            <h2 className="room__game-title">{game.name}</h2>
            <p className="room__game-tagline">{game.tagline}</p>
          </div>
        </div>

        <div className="room__score-card">
          <div className="room__score-label">
            <i className="bx bx-trophy" style={{marginRight:5}} />
            First to {winTarget} wins
          </div>
          <div className="room__score-row">
            <ScorePip player="X" name={players.X.name} color={players.X.color} score={scores.X} target={winTarget} isMe={playerRole==='X'} />
            <span className="room__score-vs">vs</span>
            <ScorePip player="O" name={players.O.name} color={players.O.color} score={scores.O} target={winTarget} isMe={playerRole==='O'} />
          </div>
          {session.seriesWinner && (
            <div className="room__series-winner" style={{color:players[session.seriesWinner].color}}>
              <i className="bx bx-party" /> {players[session.seriesWinner].name} wins the series!
            </div>
          )}
        </div>

        <div className="room__role">
          <div className="role-token" style={{background:players[playerRole].color}}>{playerRole}</div>
          <div>
            <div className="role-label">{players[playerRole].name} — you are {playerRole}</div>
            <div className="role-sub">{lobbyRole==='host' ? 'Host · Goes first' : 'Guest · Second'}</div>
          </div>
        </div>

        {session.dare && session.dareType !== 'none' && (
          <DareBet text={session.dare} type={session.dareType} />
        )}

        <div style={{padding:'14px',background:'var(--bg-inner)',border:'var(--border-thin)',borderRadius:'var(--radius-md)',boxShadow:'2px 2px 0 var(--ink)'}}>
          <GameCode code={code} />
        </div>

        <details className="room__rules">
          <summary><i className="bx bx-book-open" style={{marginRight:5}} />How to play</summary>
          <p>{game.description}</p>
        </details>

        {session.seriesWinner && (
          <button className="btn btn-primary" style={{marginTop:'auto'}} onClick={() => navigate('/home')}>
            <i className="bx bx-home" /> Back to Home
          </button>
        )}
      </aside>

      <main className="room__main animate-up delay-2">
        <div className="room__game-wrapper">
          <GameComponent
            gameState={session.gameState}
            onMove={updateGameState}
            playerRole={playerRole}
            players={players}
            onRoundWin={handleRoundWin}
          />
        </div>
      </main>
    </div>
  )
}

function ScorePip({ player, name, color, score, target, isMe }) {
  const pips = Array.from({ length: target }, (_, i) => i < score)
  return (
    <div className="score-pip-group">
      <div className="score-pip-token" style={{background:color}}>{player}</div>
      <div className="score-pip-name">{isMe ? 'You' : name}</div>
      <div className="score-pip-dots">
        {pips.map((filled, i) => (
          <div key={i} className={`score-dot ${filled?'score-dot--filled':''}`}
            style={filled?{background:color,borderColor:color}:{}} />
        ))}
      </div>
    </div>
  )
}
