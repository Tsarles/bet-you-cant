// pages/GameRoom.jsx
// Side-switching: winner keeps symbol, loser switches. hostIsX tracks who is X.
// End game: shows GameOver screen when series is won.

import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import useGameSession from '../hooks/useGameSession'
import { getGame } from '../games'
import DareBet    from '../components/DareBet'
import GameCode   from '../components/GameCode'
import GameOver   from '../components/GameOver'
import SuggestGame from '../components/SuggestGame'
import { loadSession, saveSession, updateScores } from '../utils/sessionStore'
import './GameRoom.css'

export default function GameRoom() {
  const { gameId: code } = useParams()
  const [params]         = useSearchParams()
  const navigate         = useNavigate()
  const lobbyRole        = params.get('role') || 'host'

  const { session, loading, updateGameState } = useGameSession(code, lobbyRole)

  const gameActiveRef  = useRef(false)
  const [leavePrompt,  setLeavePrompt]  = useState(false)
  const [pendingNav,   setPendingNav]   = useState(null)
  const [showSuggest,  setShowSuggest]  = useState(false)

  // hostIsX: true = host plays X this round (defaults true round 1)
  const hostIsX    = session?.hostIsX !== false
  const playerRole = lobbyRole === 'host'
    ? (hostIsX ? 'X' : 'O')
    : (hostIsX ? 'O' : 'X')

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

  // Called by game component when a round ends
  async function handleRoundWin(winnerSymbol) {
    if (!session) return
    const current   = session.scores    || { X:0, O:0 }
    const winTarget = session.winTarget || 3
    const newScores = { ...current, [winnerSymbol]: (current[winnerSymbol]||0) + 1 }
    const isSeriesWon = newScores[winnerSymbol] >= winTarget

    try {
      const s = await loadSession(code)
      if (!s) return

      // Switch sides: flip hostIsX for next round
      // Winner keeps their symbol → loser switches → hostIsX flips
      const newHostIsX = isSeriesWon ? s.hostIsX : !s.hostIsX

      await saveSession(code, {
        ...s,
        scores:       newScores,
        hostIsX:      newHostIsX,
        seriesWinner: isSeriesWon ? winnerSymbol : null,
        // Reset game state for next round
        gameState:    isSeriesWon ? s.gameState : getGame(s.gameId)?.createInitialState(),
      })
    } catch (err) {
      console.error('handleRoundWin error:', err)
    }
  }

  // Play again: reset scores + game state, keep same players
  async function handlePlayAgain() {
    try {
      const s = await loadSession(code)
      if (!s) return
      const game = getGame(s.gameId)
      await saveSession(code, {
        ...s,
        scores:       { X:0, O:0 },
        seriesWinner: null,
        hostIsX:      true,  // reset to default
        gameState:    game?.createInitialState(),
      })
    } catch (err) {
      console.error('handlePlayAgain error:', err)
    }
  }

  if (loading || !session) return (
    <div className="room room--loading">
      <i className="bx bx-loader-alt bx-spin" style={{fontSize:'2rem',color:'var(--green-muted)'}} />
      <p>Loading game...</p>
    </div>
  )

  const game = getGame(session.gameId)
  if (!game) return (
    <div className="room room--loading">
      <p>Unknown game.</p>
      <button className="btn btn-ghost" onClick={() => navigate('/home')}>Home</button>
    </div>
  )

  const GameComponent = game.component
  const scores        = session.scores    || { X:0, O:0 }
  const winTarget     = session.winTarget || 3
  const rawPlayers    = session.players   || {
    X: { name:'Player 1', color:'#c0392b' },
    O: { name:'Player 2', color:'#2471a3' },
  }

  // Map physical players (host/guest) to symbols (X/O) based on current round
  // displayPlayers[symbol] = { name, color } for whoever is playing that symbol
  const displayPlayers = {
    X: hostIsX ? rawPlayers.X : rawPlayers.O,
    O: hostIsX ? rawPlayers.O : rawPlayers.X,
  }

  // Series winner info for GameOver screen
  const seriesWinnerSymbol = session.seriesWinner
  const seriesWinner = seriesWinnerSymbol
    ? { ...displayPlayers[seriesWinnerSymbol], symbol: seriesWinnerSymbol, name: displayPlayers[seriesWinnerSymbol].name }
    : null
  const seriesLoser = seriesWinnerSymbol
    ? { ...displayPlayers[seriesWinnerSymbol==='X'?'O':'X'], symbol: seriesWinnerSymbol==='X'?'O':'X', name: displayPlayers[seriesWinnerSymbol==='X'?'O':'X'].name }
    : null

  return (
    <div className="room">

      {/* ── Leave confirmation ── */}
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
              <button className="btn btn-ghost"
                style={{color:'var(--red-ink)',borderColor:'var(--red-ink)'}}
                onClick={confirmLeave}>
                <i className="bx bx-exit" /> Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Suggest modal ── */}
      {showSuggest && (
        <div className="leave-overlay" onClick={() => setShowSuggest(false)}>
          <div onClick={e => e.stopPropagation()}>
            <SuggestGame onClose={() => setShowSuggest(false)} />
          </div>
        </div>
      )}

      {/* ── Series end screen ── */}
      {seriesWinner && (
        <GameOver
          winner={seriesWinner}
          loser={seriesLoser}
          scores={scores}
          dare={session.dare}
          dareType={session.dareType}
          onPlayAgain={handlePlayAgain}
          onHome={() => navigate('/home')}
        />
      )}

      {/* ── Sidebar ── */}
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

        {/* Score tracker */}
        <div className="room__score-card">
          <div className="room__score-label">
            <i className="bx bx-trophy" style={{marginRight:5}} />
            First to {winTarget} wins
          </div>
          <div className="room__score-row">
            <ScorePip symbol="X" name={displayPlayers.X.name} color={displayPlayers.X.color}
              score={scores.X} target={winTarget} isMe={playerRole==='X'} />
            <span className="room__score-vs">vs</span>
            <ScorePip symbol="O" name={displayPlayers.O.name} color={displayPlayers.O.color}
              score={scores.O} target={winTarget} isMe={playerRole==='O'} />
          </div>
          {/* Side switch indicator */}
          <div className="room__side-switch">
            <i className="bx bx-transfer" />
            <span>Sides switch after each round</span>
          </div>
        </div>

        {/* Your role this round */}
        <div className="room__role">
          <div className="role-token" style={{background: displayPlayers[playerRole].color}}>
            {playerRole}
          </div>
          <div>
            <div className="role-label">
              {displayPlayers[playerRole].name} — playing as {playerRole}
            </div>
            <div className="role-sub">
              {lobbyRole==='host' ? 'Host' : 'Guest'} · {playerRole==='X' ? 'Goes first' : 'Goes second'}
            </div>
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

        <button className="btn btn-secondary room__suggest-btn" onClick={() => setShowSuggest(true)}>
          <i className="bx bx-bulb" /> Suggest a Game
        </button>

        <p className="room__footer-credit">
          © 2026 Bet You Can't ·{' '}
          <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">@Tsarles</a>
        </p>
      </aside>

      {/* ── Main game area ── */}
      <main className="room__main animate-up delay-2">
        <div className="room__game-wrapper">
          <GameComponent
            gameState={session.gameState}
            onMove={updateGameState}
            playerRole={playerRole}
            players={displayPlayers}
            onRoundWin={handleRoundWin}
          />
        </div>
      </main>
    </div>
  )
}

function ScorePip({ symbol, name, color, score, target, isMe }) {
  const pips = Array.from({ length: target }, (_, i) => i < score)
  return (
    <div className="score-pip-group">
      <div className="score-pip-token" style={{background:color}}>{symbol}</div>
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
