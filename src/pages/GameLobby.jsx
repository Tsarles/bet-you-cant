// pages/GameLobby.jsx — with win target, dare config, player colors

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

  const { session, markJoined } = useGameSession(code, playerRole)
  const [notFound, setNotFound] = useState(false)

  // Host-editable settings
  const [winTarget,  setWinTarget]  = useState(3)
  const [dareType,   setDareType]   = useState('none')
  const [dareText,   setDareText]   = useState('')
  const [saved,      setSaved]      = useState(false)

  /* Guest: join and load existing settings */
  useEffect(() => {
    if (playerRole !== 'guest') return
    const s = loadSession(code)
    if (!s) { setNotFound(true); return }
    // Apply guest info from sessionStorage
    try {
      const info = JSON.parse(sessionStorage.getItem('guestInfo') || '{}')
      joinSession(code, { name: info.name || 'Player 2', color: info.color || '#2471a3' })
      markJoined()
    } catch {}
    setDareType(s.dareType || 'none')
    setDareText(s.dare || '')
    setWinTarget(s.winTarget || 3)
  }, [playerRole, code]) // eslint-disable-line

  /* Sync settings when session updates */
  useEffect(() => {
    if (!session || playerRole === 'host') return
    setDareType(session.dareType || 'none')
    setDareText(session.dare || '')
    setWinTarget(session.winTarget || 3)
  }, [session?.dareType, session?.dare, session?.winTarget, playerRole])

  /* Navigate when host starts */
  useEffect(() => {
    if (session?.started) navigate(`/room/${code}?role=${playerRole}`)
  }, [session?.started, code, playerRole, navigate])

  if (notFound) {
    return (
      <div className="lobby lobby--error">
        <div className="card" style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:14,maxWidth:340}}>
          <i className="bx bx-confused-face" style={{fontSize:'3rem',color:'var(--green-muted)'}} />
          <p className="lobby-error-title">Code not found!</p>
          <p style={{fontFamily:'var(--font-body)',color:'var(--ink-muted)'}}>Ask your friend for the right code.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/home')}>
            <i className="bx bx-arrow-back" /> Back
          </button>
        </div>
      </div>
    )
  }

  const game        = session ? getGame(session.gameId) : null
  const guestJoined = !!session?.player2Joined
  const hostInfo    = session?.players?.X
  const guestInfo   = session?.players?.O

  function saveSettings() {
    const s = loadSession(code)
    if (!s) return
    saveSession(code, { ...s, winTarget, dareType, dare: dareText })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function handleStart() {
    const s = loadSession(code)
    if (!s) return
    saveSession(code, { ...s, winTarget, dareType, dare: dareText, started: true })
    navigate(`/room/${code}?role=host`)
  }

  const currentDareLabel = DARE_TYPES.find(d => d.value === dareType)?.label || ''

  return (
    <div className="lobby">
      <button className="btn btn-ghost lobby-back" onClick={() => navigate('/home')}>
        <i className="bx bx-arrow-back" /> Home
      </button>

      <div className="lobby__inner animate-up">
        {/* Header */}
        <div className="lobby__header">
          <div className="lobby__game-icon">
            <i className={`bx ${game?.bxIcon || 'bx-game'}`} />
          </div>
          <div>
            <h1 className="lobby__title">{playerRole==='host' ? 'Your Lobby' : 'Joined!'}</h1>
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
            <div className="card animate-up delay-1">
              <GameCode code={code} />
            </div>

            {/* Players */}
            <div className="card animate-up delay-2">
              <div className="card-label"><i className="bx bx-group" style={{marginRight:5}} />Players</div>
              <div className="lobby__player-list">
                <PlayerRow
                  name={hostInfo?.name || 'Player 1'}
                  color={hostInfo?.color || '#c0392b'}
                  symbol="X" isYou={playerRole==='host'}
                  status="In lobby" joined={true}
                />
                <PlayerRow
                  name={guestInfo?.name || 'Player 2'}
                  color={guestInfo?.color || '#2471a3'}
                  symbol="O" isYou={playerRole==='guest'}
                  status={guestJoined ? 'Joined!' : 'Waiting...'}
                  joined={guestJoined}
                />
              </div>
            </div>

            {/* Score target */}
            <div className="card animate-up delay-2">
              <div className="card-label"><i className="bx bx-trophy" style={{marginRight:5}} />Win Series</div>
              {playerRole === 'host' ? (
                <>
                  <p className="lobby-setting-hint">First to how many wins?</p>
                  <div className="win-target-row">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        className={`win-btn ${winTarget===n ? 'win-btn--active' : ''}`}
                        onClick={() => setWinTarget(n)}
                      >{n}</button>
                    ))}
                  </div>
                  <p className="win-target-label">First to <strong>{winTarget}</strong> win{winTarget>1?'s':''}</p>
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
            {/* Dare/bet setup (host) */}
            {playerRole === 'host' && (
              <div className="card animate-up delay-2">
                <div className="card-label">
                  <i className="bx bx-target-lock" style={{marginRight:5}} />
                  Dare / Bet Setup <span className="card-label-opt">(optional)</span>
                </div>

                <div className="dare-field">
                  <label className="dare-field-label">Type</label>
                  <div className="select-wrap">
                    <select className="select" value={dareType} onChange={e => setDareType(e.target.value)}>
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
                        dareType === 'dare' ? 'e.g. Loser does 20 push-ups...' :
                        dareType === 'bet'  ? 'e.g. Loser buys drinks...' :
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
                  {saved ? <><i className="bx bx-check" /> Saved!</> : <><i className="bx bx-save" /> Save Settings</>}
                </button>
              </div>
            )}

            {/* Guest: show existing dare */}
            {playerRole === 'guest' && dareType !== 'none' && dareText && (
              <div className="animate-up delay-2"><DareBet text={dareText} type={dareType} /></div>
            )}
            {playerRole === 'guest' && dareType === 'none' && (
              <div className="card lobby__no-dare animate-up delay-2">
                <i className="bx bx-smile" style={{fontSize:'1.4rem',color:'var(--green-muted)'}} />
                <p>No dare set — just bragging rights!</p>
              </div>
            )}

            {/* Game info */}
            {game && (
              <div className="card animate-up delay-3">
                <div className="card-label"><i className="bx bx-book-open" style={{marginRight:5}} />How to play</div>
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
                  disabled={!guestJoined}
                >
                  {guestJoined
                    ? <><i className="bx bx-play-circle" /> Start Game!</>
                    : <><i className="bx bx-loader-alt bx-spin" /> Waiting for Player 2...</>
                  }
                </button>
              </div>
            ) : (
              <div className="card lobby__guest-wait animate-up delay-3">
                <span className="blink-dot" />
                <p>Waiting for the host to start...</p>
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
      <div className="lpr-token" style={{ background: color, borderColor: color }}>{symbol}</div>
      <div className="lpr-info">
        <span className="lpr-name">{name} {isYou && <strong>(You)</strong>}</span>
        <span className="lpr-status">{status}</span>
      </div>
    </div>
  )
}
