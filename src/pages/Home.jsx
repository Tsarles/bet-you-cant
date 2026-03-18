// pages/Home.jsx — with player name + color setup

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GAMES from '../games'
import GameCard from '../components/GameCard'
import PlayerSetup from '../components/PlayerSetup'
import { generateCode, saveSession, loadSession, PLAYER_COLORS } from '../utils/sessionStore'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [selectedGame, setSelectedGame] = useState(GAMES[0])
  const [joinCode, setJoinCode]         = useState('')
  const [joinError, setJoinError]       = useState('')
  const [tab, setTab]                   = useState('start')

  const [hostPlayer, setHostPlayer]   = useState({ name: '', color: PLAYER_COLORS[0].value })
  const [guestPlayer, setGuestPlayer] = useState({ name: '', color: PLAYER_COLORS[1].value })

  function handleStart() {
    if (!selectedGame) return
    const code = generateCode()
    saveSession(code, {
      code,
      gameId: selectedGame.id,
      gameState: selectedGame.createInitialState(),
      dare: '',
      dareType: 'none',
      winTarget: 3,
      player2Joined: false,
      started: false,
      players: {
        X: { name: hostPlayer.name || 'Player 1', color: hostPlayer.color },
        O: { name: 'Player 2', color: PLAYER_COLORS[1].value },
      },
      scores: { X: 0, O: 0 },
    })
    navigate(`/lobby/${code}?role=host`)
  }

  function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (!code) { setJoinError('Enter a code!'); return }
    const session = loadSession(code)
    if (!session) { setJoinError("Code not found — double check it!"); return }
    setJoinError('')
    // Store guest info before navigating
    sessionStorage.setItem('guestInfo', JSON.stringify({
      name: guestPlayer.name || 'Player 2',
      color: guestPlayer.color,
    }))
    navigate(`/lobby/${code}?role=guest`)
  }

  return (
    <div className="home">
      <header className="home__header animate-up">
        <button className="btn btn-ghost home-back" onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back" />
        </button>
        <div className="home__logo">
          <div className="home__logo-icon"><i className="bx bx-dice-5" /></div>
          <h1 className="home__title">
            <span className="home__bet">Bet</span>{' '}
            <span className="home__you">You</span>{' '}
            <span className="home__cant">Can't</span>
          </h1>
        </div>
        <p className="home__subtitle animate-up delay-1">
          Pick a game — enter your name — challenge a friend
        </p>
      </header>

      <main className="home__main">
        {/* Left: game list */}
        <section className="home__games-card animate-up delay-2">
          <span className="section-label"><i className="bx bx-joystick" style={{marginRight:5}} />Pick a Game</span>
          <div className="home__game-list">
            {GAMES.map(game => (
              <GameCard key={game.id} game={game} selected={selectedGame?.id === game.id} onSelect={setSelectedGame} />
            ))}
            <div className="home__game-placeholder">
              <i className="bx bx-plus-circle placeholder-icon" />
              <div>
                <p className="placeholder-title">More games coming soon</p>
                <p className="placeholder-sub">Add a folder in src/games/ to extend</p>
              </div>
            </div>
          </div>
          {selectedGame && (
            <div className="home__game-desc animate-fade">
              <i className="bx bx-info-circle home__game-desc-icon" />
              <p>{selectedGame.description}</p>
            </div>
          )}
        </section>

        {/* Right: action panel */}
        <aside className="home__panel animate-up delay-3">
          <div className="panel-tabs">
            <button className={`panel-tab ${tab==='start'?'panel-tab--active':''}`} onClick={()=>setTab('start')}>
              <i className="bx bx-rocket" /> Start
            </button>
            <button className={`panel-tab ${tab==='join'?'panel-tab--active':''}`} onClick={()=>setTab('join')}>
              <i className="bx bx-link" /> Join
            </button>
          </div>

          {tab === 'start' && (
            <div className="panel-body animate-fade">
              <PlayerSetup value={hostPlayer} onChange={setHostPlayer} label="Your Name (Player 1)" />
              {selectedGame ? (
                <div className="panel-selected-game">
                  <i className={`bx ${selectedGame.bxIcon}`} />
                  {selectedGame.name}
                </div>
              ) : (
                <p className="panel-no-game">← pick a game first</p>
              )}
              <button className="btn btn-primary panel-cta" onClick={handleStart} disabled={!selectedGame}>
                <i className="bx bx-code-alt" /> Generate Code
              </button>
            </div>
          )}

          {tab === 'join' && (
            <div className="panel-body animate-fade">
              <div className="panel-join-code-row">
                <label className="ps-label"><i className="bx bx-hash" /> Enter Code</label>
                <div className="panel-join-row">
                  <input
                    className="input panel-join-input"
                    placeholder="ABC-123"
                    value={joinCode}
                    onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
                    onKeyDown={e => e.key==='Enter' && handleJoin()}
                    maxLength={7} spellCheck={false}
                  />
                </div>
                {joinError && <p className="panel-error"><i className="bx bx-error-circle" /> {joinError}</p>}
              </div>
              <PlayerSetup value={guestPlayer} onChange={setGuestPlayer} label="Your Name (Player 2)" />
              <button className="btn btn-secondary panel-cta" onClick={handleJoin}>
                <i className="bx bx-log-in" /> Join Game
              </button>
            </div>
          )}

          <p className="panel-footnote">
            <i className="bx bx-pencil" style={{verticalAlign:'middle',marginRight:4}} />
            Dare / bet &amp; win target set in the lobby
          </p>
        </aside>
      </main>
    </div>
  )
}
