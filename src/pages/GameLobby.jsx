// pages/GameLobby.jsx — fully async Firebase version
// Host sees Player 2 join in real-time via watchSession listener

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import GameCode  from '../components/GameCode'
import DareBet   from '../components/DareBet'
import useGameSession from '../hooks/useGameSession'
import { loadSession, saveSession, joinSession, DARE_TYPES } from '../utils/sessionStore'
import { getGame } from '../games'
import './GameLobby.css'

export default function GameLobby() {
  const { gameId: code } = useParams()
  const [params]         = useSearchParams()
  const navigate         = useNavigate()
  const playerRole       = params.get('role') || 'host'

  // session updates in real-time via Firebase onSnapshot
  const { session, loading } = useGameSession(code, playerRole)

  const [notFound,  setNotFound]  = useState(false)
  const [joining,   setJoining]   = useState(false)
  const [starting,  setStarting]  = useState(false)
  const [saved,     setSaved]     = useState(false)

  // Host-editable settings (local state, saved to Firebase on demand)
  const [winTarget, setWinTarget] = useState(3)
  const [dareType,  setDareType]  = useState('none')
  const [dareText,  setDareText]  = useState('')

  // ── GUEST: join once on mount ──────────────────────────────
  useEffect(() => {
    if (playerRole !== 'guest') return

    async function doJoin() {
      setJoining(true)
      try {
        // Read guest info that Home.jsx stored in sessionStorage
        let guestInfo = { name: 'Player 2', color: '#2471a3' }
        try {
          const stored = sessionStorage.getItem('guestInfo')
          if (stored) guestInfo = JSON.parse(stored)
        } catch {}

        // Write guest info + player2Joined=true to Firebase
        const result = await joinSession(code, guestInfo)
        if (!result) {
          setNotFound(true)
          return
        }
        // Load current settings from the session
        setDareType(result.dareType || 'none')
        setDareText(result.dare || '')
        setWinTarget(result.winTarget || 3)
      } catch (err) {
        console.error('Join failed:', err)
        setNotFound(true)
      } finally {
        setJoining(false)
      }
    }

    doJoin()
  }, []) // eslint-disable-line

  // ── Keep guest's local dare/settings in sync with host ──────
  useEffect(() => {
    if (!session || playerRole !== 'guest') return
    setDareType(session.dareType || 'none')
    setDareText(session.dare     || '')
    setWinTarget(session.winTarget || 3)
  }, [session?.dareType, session?.dare, session?.winTarget, playerRole])

  // ── Navigate to game room when host starts ───────────────────
  useEffect(() => {
    if (session?.started) {
      navigate(`/room/${code}?role=${playerRole}`)
    }
  }, [session?.started, code, playerRole, navigate])

  // ── HOST: save settings to Firebase ─────────────────────────
  async function saveSettings() {
    try {
      const s = await loadSession(code)
      if (!s) return
      await saveSession(code, { ...s, winTarget, dareType, dare: dareText })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save settings failed:', err)
    }
  }

  // ── HOST: start the game ─────────────────────────────────────
  async function handleStart() {
    if (starting) return
    setStarting(true)
    try {
      const s = await loadSession(code)
      if (!s) return
      await saveSession(code, {
        ...s,
        winTarget,
        dareType,
        dare: dareText,
        started: true,
      })
      navigate(`/room/${code}?role=host`)
    } catch (err) {
      console.error('Start failed:', err)
      setStarting(false)
    }
  }

  // ── Error: code not found ────────────────────────────────────
  if (notFound) {
    return (
      <div className="lobby lobby--error">
        <div className="card" style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:14,maxWidth:340}}>
          <i className="bx bx-confused-face" style={{fontSize:'3rem',color:'var(--green-muted)'}} />
          <p className="lobby-error-title">Code not found!</p>
          <p style={{fontFamily:'var(--font-body)',color:'var(--ink-muted)'}}>
            Ask your friend for the right code, or start a new game.
          </p>
          <button className="btn btn-secondary" onClick={() => navigate('/home')}>
            <i className="bx bx-arrow-back" /> Back
          </button>
        </div>
      </div>
    )
  }

  // ── Loading spinner ──────────────────────────────────────────
  if (loading || (playerRole === 'guest' && joining)) {
    return (
      <div className="lobby lobby--loading">
        <i className="bx bx-loader-alt bx-spin" style={{fontSize:'2.5rem',color:'var(--green-muted)'}} />
        <p style={{fontFamily:'var(--font-display)',color:'var(--ink-muted)',marginTop:12}}>
          {playerRole === 'guest' ? 'Joining game...' : 'Loading lobby...'}
        </p>
      </div>
    )
  }

  const game        = session ? getGame(session.gameId) : null
  const guestJoined = !!session?.player2Joined
  const hostInfo    = session?.players?.X
  const guestInfo   = session?.players?.O

  return (
    <div className="lobby">
      <button className="btn btn-ghost lobby-back" onClick={() => navigate('/home')}>
        <i className="bx bx-arrow-back" /> Home
      </button>

      <div className="lobby__inner animate-up">

        {/* ── Header ── */}
        <div className="lobby__header">
          <div className="lobby__game-icon">
            <i className={`bx ${game?.bxIcon || 'bx-game'}`} />
          </div>
          <div>
            <h1 className="lobby__title">
              {playerRole === 'host' ? 'Your Lobby' : 'Joined!'}
            </h1>
            <p className="lobby__game-name">{game?.name}</p>
          </div>
          <div className={`lobby__badge ${guestJoined ? 'lobby__badge--ready' : ''}`}>
            {guestJoined
              ? <><i className="bx bx-check-circle" /> Ready</>
              : <><span className="blink-dot" style={{marginRight:6}} /> Waiting</>
            }
          </div>
        </div>

        <div className="lobby__body">

          {/* ── Left column ── */}
          <div className="lobby__left">

            {/* Join code */}
            <div className="card animate-up delay-1">
              <GameCode code={code} />
            </div>

            {/* Players */}
            <div className="card animate-up delay-2">
              <div className="card-label">
                <i className="bx bx-group" style={{marginRight:5}} />Players
              </div>
              <div className="lobby__player-list">
                <PlayerRow
                  name={hostInfo?.name || 'Player 1'}
                  color={hostInfo?.color || '#c0392b'}
                  symbol="X"
                  isYou={playerRole === 'host'}
                  status="In lobby"
                  joined={true}
                />
                <PlayerRow
                  name={guestInfo?.name || 'Waiting...'}
                  color={guestInfo?.color || '#2471a3'}
                  symbol="O"
                  isYou={playerRole === 'guest'}
                  status={guestJoined ? `${guestInfo?.name || 'Player 2'} joined!` : 'Waiting for friend...'}
                  joined={guestJoined}
                />
              </div>
            </div>

            {/* Win target */}
            <div className="card animate-up delay-2">
              <div className="card-label">
                <i className="bx bx-trophy" style={{marginRight:5}} />Win Series
              </div>
              {playerRole === 'host' ? (
                <>
                  <p className="lobby-setting-hint">First to how many wins?</p>
                  <div className="win-target-row">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        className={`win-btn ${winTarget === n ? 'win-btn--active' : ''}`}
                        onClick={() => setWinTarget(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="win-target-label">
                    First to <strong>{winTarget}</strong> win{winTarget > 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <p className="lobby-setting-display">
                  First to <strong>{session?.winTarget || 3}</strong> wins
                </p>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lobby__right">

            {/* Dare/bet — host only */}
            {playerRole === 'host' && (
              <div className="card animate-up delay-2">
                <div className="card-label">
                  <i className="bx bx-target-lock" style={{marginRight:5}} />
                  Dare / Bet <span className="card-label-opt">(optional)</span>
                </div>

                <div className="dare-field">
                  <label className="dare-field-label">Type</label>
                  <div className="select-wrap">
                    <select
                      className="select"
                      value={dareType}
                      onChange={e => setDareType(e.target.value)}
                    >
                      {DARE_TYPES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <i className="bx bx-chevron-down select-chevron" />
                  </div>
                </div>

                {dareType !== 'none' && (
                  <div className="dare-field">
                    <label className="dare-field-label">Description</label>
                    <textarea
                      className="input"
                      placeholder={
                        dareType === 'dare'  ? 'e.g. Loser does 20 push-ups...' :
                        dareType === 'bet'   ? 'e.g. Loser buys the drinks...'  :
                                              'e.g. Loser reveals their biggest secret...'
                      }
                      value={dareText}
                      onChange={e => setDareText(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <button
                  className={`btn ${saved ? 'btn-secondary' : 'btn-ghost'} dare-save-btn`}
                  onClick={saveSettings}
                >
                  {saved
                    ? <><i className="bx bx-check" /> Saved!</>
                    : <><i className="bx bx-save" /> Save Settings</>
                  }
                </button>
              </div>
            )}

            {/* Dare display — guest only */}
            {playerRole === 'guest' && dareType !== 'none' && dareText && (
              <div className="animate-up delay-2">
                <DareBet text={dareText} type={dareType} />
              </div>
            )}
            {playerRole === 'guest' && dareType === 'none' && (
              <div className="card lobby__no-dare animate-up delay-2">
                <i className="bx bx-smile" style={{fontSize:'1.4rem',color:'var(--green-muted)'}} />
                <p>No dare set — just bragging rights!</p>
              </div>
            )}

            {/* How to play */}
            {game && (
              <div className="card animate-up delay-3">
                <div className="card-label">
                  <i className="bx bx-book-open" style={{marginRight:5}} />How to play
                </div>
                <p className="lobby__game-desc">{game.description}</p>
              </div>
            )}

            {/* CTA */}
            {playerRole === 'host' ? (
              <div className="animate-up delay-4">
                {!guestJoined && (
                  <p className="lobby__waiting-msg">
                    <span className="blink-dot" /> Waiting for your friend to join...
                  </p>
                )}
                <button
                  className="btn btn-primary lobby__start-btn"
                  onClick={handleStart}
                  disabled={!guestJoined || starting}
                >
                  {starting
                    ? <><i className="bx bx-loader-alt bx-spin" /> Starting...</>
                    : guestJoined
                      ? <><i className="bx bx-play-circle" /> Start Game!</>
                      : <><i className="bx bx-loader-alt bx-spin" /> Waiting for Player 2...</>
                  }
                </button>
              </div>
            ) : (
              <div className="card lobby__guest-wait animate-up delay-3">
                <span className="blink-dot" />
                <p>Waiting for the host to start the game...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerRow({ name, color, symbol, isYou, status, joined }) {
  return (
    <div className={`lobby-player-row ${!joined ? 'lobby-player-row--dim' : ''}`}>
      <div className="lpr-token" style={{background:color, borderColor:color}}>
        {symbol}
      </div>
      <div className="lpr-info">
        <span className="lpr-name">
          {name} {isYou && <strong>(You)</strong>}
        </span>
        <span className="lpr-status">{status}</span>
      </div>
    </div>
  )
}
