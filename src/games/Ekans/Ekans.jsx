// Ekans — Chaotic Snake
// Every 5th apple: controls get RANDOMLY remapped (not just flipped)
// e.g. Up→Right, Down→Left, Left→Up, Right→Down — completely random each time

import { useState, useEffect, useRef } from 'react'
import './Ekans.css'

const GRID = 18, TICK = 175

function rnd(max) { return Math.floor(Math.random() * max) }
function rndPos(exclude=[]) {
  let p
  do { p={x:rnd(GRID),y:rnd(GRID)} } while(exclude.some(e=>e.x===p.x&&e.y===p.y))
  return p
}

// All 4 directions as vectors
const D_UP    = { x:0,  y:-1 }
const D_DOWN  = { x:0,  y:1  }
const D_LEFT  = { x:-1, y:0  }
const D_RIGHT = { x:1,  y:0  }
const ALL_DIRS = [D_UP, D_DOWN, D_LEFT, D_RIGHT]

// Map from key string to direction index (0=up,1=down,2=left,3=right)
const KEY_TO_IDX = {
  ArrowUp:0, ArrowDown:1, ArrowLeft:2, ArrowRight:3,
  w:0, s:1, a:2, d:3,
}
const IDX_TO_DIR = [D_UP, D_DOWN, D_LEFT, D_RIGHT]

// Generate a RANDOM remapping of the 4 direction indices
// Returns array where remap[i] = new direction index for key i
// Ensures it's never the identity (all same) and never a simple flip
function makeRandomRemap() {
  const indices = [0,1,2,3]
  // Shuffle
  for (let i=3; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  // Make sure it's not the identity
  if (indices.every((v,i)=>v===i)) {
    // Swap first two
    [indices[0], indices[1]] = [indices[1], indices[0]]
  }
  return indices
}

const IDENTITY_MAP = [0,1,2,3]

// Direction labels for display
const DIR_NAMES = ['Up','Down','Left','Right']
const DIR_ICONS = ['bx-up-arrow-alt','bx-down-arrow-alt','bx-left-arrow-alt','bx-right-arrow-alt']

function makeInitial() {
  const snake = [{x:9,y:9},{x:8,y:9},{x:7,y:9}]
  return {
    snake, dir:D_RIGHT, nextDirIdx:3,
    apple: rndPos(snake),
    voids: [],
    score:0, applesEaten:0,
    dirRemap: IDENTITY_MAP,  // current control mapping
    remapCount:0,
    forgiveness:2,
    history:[],
    status:'playing',
  }
}

export default function Ekans({ gameState, onMove, playerRole, players, onRoundWin }) {
  const [local,  setLocal]  = useState(null)
  const [phase,  setPhase]  = useState('intro')
  const tickRef             = useRef(null)

  const myName  = players?.[playerRole]?.name  || `Player ${playerRole}`
  const myColor = players?.[playerRole]?.color || '#2471a3'
  const oppRole = playerRole==='X' ? 'O' : 'X'
  const oppName = players?.[oppRole]?.name || `Player ${oppRole}`

  function startGame() {
    setLocal(makeInitial())
    setPhase('playing')
  }

  // ── Tick ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      setLocal(prev => {
        if (!prev || prev.status !== 'playing') return prev
        const st = {...prev}

        // Apply remapped direction
        const remappedIdx = st.dirRemap[st.nextDirIdx]
        let d = IDX_TO_DIR[remappedIdx]

        // Prevent 180-turn
        if (d.x === -st.dir.x && d.y === -st.dir.y) d = st.dir
        st.dir = d

        const head = {
          x:(st.snake[0].x + d.x + GRID) % GRID,
          y:(st.snake[0].y + d.y + GRID) % GRID,
        }
        const newSnake = [head, ...st.snake]
        st.history = [...(st.history||[]).slice(-6), st.snake.map(p=>({...p}))]

        // Void tile teleport
        const voidHit = (st.voids||[]).find(v=>v.x===head.x&&v.y===head.y)
        if (voidHit) {
          newSnake[0] = rndPos([...newSnake,...(st.voids||[]).filter(v=>v!==voidHit)])
          st.voids = (st.voids||[]).filter(v=>v!==voidHit)
        }

        // Self-collision
        const selfHit = newSnake.slice(1).some(s=>s.x===head.x&&s.y===head.y)
        if (selfHit) {
          if (st.forgiveness > 0) {
            const prev3 = st.history[st.history.length-3] || st.history[0] || st.snake
            return {...st, snake:prev3, forgiveness:st.forgiveness-1, nextDirIdx:st.nextDirIdx}
          }
          return {...st, snake:st.snake, status:'dead'}
        }

        // Apple
        let score=st.score, eaten=st.applesEaten, growing=false
        let dirRemap=[...st.dirRemap], remapCount=st.remapCount

        if (head.x===st.apple.x && head.y===st.apple.y) {
          score++; eaten++; growing=true
          st.apple = rndPos(newSnake)

          // Every 5th apple: RANDOM remap (permanent until next 5th)
          if (eaten % 5 === 0) {
            dirRemap   = makeRandomRemap()
            remapCount++
          }

          // Every 7th apple: void tile
          if (eaten % 7 === 0) {
            const nv = rndPos([...newSnake, st.apple, ...(st.voids||[])])
            st.voids = [...(st.voids||[]).slice(-2), nv]
          }
        }
        if (!growing) newSnake.pop()

        return {...st, snake:newSnake, score, applesEaten:eaten, dirRemap, remapCount}
      })
    }, TICK)
    return () => clearInterval(tickRef.current)
  }, [phase])

  // ── Keyboard ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    function onKey(e) {
      const idx = KEY_TO_IDX[e.key] ?? KEY_TO_IDX[e.key?.toLowerCase()]
      if (idx !== undefined) {
        e.preventDefault()
        setLocal(prev => prev ? {...prev, nextDirIdx: idx} : prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  useEffect(() => {
    if (local?.status === 'dead') { clearInterval(tickRef.current); setPhase('dead') }
  }, [local?.status])

  function handleSubmit() {
    const s   = local?.score || 0
    const cur = gameState    || {}
    const newGs = {...cur, [`score${playerRole}`]:s, [`submitted${playerRole}`]:true}
    onMove(newGs)
    if (newGs.submittedX && newGs.submittedO && onRoundWin) {
      onRoundWin((newGs.scoreX||0) >= (newGs.scoreO||0) ? 'X' : 'O')
    }
    setPhase('submitted')
  }

  function tapDir(idx) {
    setLocal(prev => prev ? {...prev, nextDirIdx:idx} : prev)
  }

  const snakeSet  = new Set((local?.snake||[]).map(p=>`${p.x},${p.y}`))
  const isHead    = local?.snake?.[0]
  const voidSet   = new Set((local?.voids||[]).map(p=>`${p.x},${p.y}`))
  const isRemapped = local && JSON.stringify(local.dirRemap) !== JSON.stringify(IDENTITY_MAP)

  // Build control legend for display
  const keyLabels = ['↑','↓','←','→']
  const controlLegend = isRemapped && local
    ? keyLabels.map((k,i) => `${k}→${DIR_NAMES[local.dirRemap[i]]}`)
    : null

  return (
    <div className="ekans-wrapper">
      <div className="ekans-header">
        <div className="ekans-title">Ekans</div>
        <p className="ekans-subtitle">Chaotic Snake — score battle</p>
      </div>

      {/* Score chips */}
      <div className="ekans-scores">
        <EScoreChip role="X" players={players} score={gameState?.scoreX} submitted={gameState?.submittedX} localScore={local?.score} playerRole={playerRole} phase={phase} />
        <span className="ekans-vs">VS</span>
        <EScoreChip role="O" players={players} score={gameState?.scoreO} submitted={gameState?.submittedO} localScore={local?.score} playerRole={playerRole} phase={phase} />
      </div>

      {/* Control remap badge */}
      {phase==='playing' && isRemapped && (
        <div className="ekans-badge ekans-badge--chaos">
          <i className="bx bx-shuffle" />
          Controls randomly remapped! #{local.remapCount}
        </div>
      )}

      {/* Control legend */}
      {phase==='playing' && controlLegend && (
        <div className="ekans-control-legend">
          {controlLegend.map((c,i) => (
            <span key={i} className="ekans-control-chip">{c}</span>
          ))}
        </div>
      )}

      {phase==='playing' && local?.forgiveness > 0 && (
        <div className="ekans-badge ekans-badge--life">
          <i className="bx bx-heart" /> ×{local.forgiveness} forgiveness left
        </div>
      )}

      {/* Intro screen */}
      {phase==='intro' && (
        <div className="ekans-overlay">
          <p className="ekans-overlay-text">Each player plays solo. Higher score wins!</p>
          <div className="ekans-twists">
            <div className="ekans-twist"><i className="bx bx-shuffle" /><span>Every 5th apple randomly remaps your controls permanently</span></div>
            <div className="ekans-twist"><i className="bx bx-ghost" /><span>Void tiles teleport your snake</span></div>
            <div className="ekans-twist"><i className="bx bx-undo" /><span>2 forgiveness moves — collide and rewind instead of dying</span></div>
          </div>
          <p className="ekans-controls-hint">Arrow keys or WASD to move</p>
          <button className="btn btn-primary ekans-start-btn" onClick={startGame}>
            <i className="bx bx-play-circle" /> Start Playing
          </button>
        </div>
      )}

      {/* Grid */}
      {(phase==='playing'||phase==='dead') && (
        <div className="ekans-grid" style={{'--grid':GRID}}>
          {Array.from({length:GRID*GRID},(_,i)=>{
            const x=i%GRID, y=Math.floor(i/GRID), key=`${x},${y}`
            const isSnk  = snakeSet.has(key)
            const isHd   = isHead?.x===x && isHead?.y===y
            const isApl  = local?.apple?.x===x && local?.apple?.y===y
            const isVd   = voidSet.has(key)
            return (
              <div key={i} className={[
                'ekans-cell',
                isSnk?'ekans-cell--snake':'',
                isHd?'ekans-cell--head':'',
                isApl?'ekans-cell--apple':'',
                isVd?'ekans-cell--void':'',
              ].filter(Boolean).join(' ')}
              style={isSnk?{background:myColor,borderColor:myColor}:{}}
              />
            )
          })}
        </div>
      )}

      {/* D-pad */}
      {phase==='playing' && (
        <div className="ekans-dpad">
          <button className="dpad-btn dpad-up"    onClick={()=>tapDir(0)}><i className="bx bx-up-arrow-alt"/></button>
          <button className="dpad-btn dpad-left"  onClick={()=>tapDir(2)}><i className="bx bx-left-arrow-alt"/></button>
          <button className="dpad-btn dpad-right" onClick={()=>tapDir(3)}><i className="bx bx-right-arrow-alt"/></button>
          <button className="dpad-btn dpad-down"  onClick={()=>tapDir(1)}><i className="bx bx-down-arrow-alt"/></button>
        </div>
      )}

      {phase==='dead' && (
        <div className="ekans-dead">
          <p className="ekans-dead-title">Game Over!</p>
          <p className="ekans-dead-score">You scored <strong>{local?.score}</strong> points</p>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <i className="bx bx-check-circle" /> Submit Score
          </button>
        </div>
      )}

      {phase==='submitted' && (
        <div className="ekans-submitted">
          <i className="bx bx-check-circle" style={{fontSize:'2rem',color:'var(--green-mid)'}}/>
          <p>Score submitted: <strong>{local?.score}</strong></p>
          <p className="ekans-waiting">
            <span className="blink-dot" style={{marginRight:6}} />
            Waiting for {oppName} to finish...
          </p>
          {gameState?.scoreX!==null && gameState?.scoreO!==null && (
            <div className="ekans-result">
              <strong>
                {(gameState?.scoreX||0)>=(gameState?.scoreO||0)
                  ? players?.X?.name||'P1'
                  : players?.O?.name||'P2'}
              </strong> wins the round!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EScoreChip({role,players,score,submitted,localScore,playerRole,phase}) {
  const info = players?.[role]
  const isMe = playerRole===role
  const disp = submitted ? `Score: ${score}` : isMe&&phase==='playing' ? `${localScore||0} pts` : '?'
  return (
    <div className={`ekans-score-chip ${isMe?'ekans-score-chip--me':''}`}
      style={isMe?{borderColor:info?.color}:{}}>
      <div className="esc-token" style={{background:info?.color||'#888'}}>{role}</div>
      <div className="esc-info">
        <span className="esc-name">{info?.name||`P${role}`}</span>
        <span className="esc-score">{disp}</span>
      </div>
    </div>
  )
}
