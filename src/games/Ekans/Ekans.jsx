// Ekans — Chaotic Snake. Every 5th apple reverses controls PERMANENTLY.

import { useState, useEffect, useRef } from 'react'
import './Ekans.css'

const GRID = 18, TICK = 175

function rnd(max) { return Math.floor(Math.random() * max) }
function rndPos(exclude=[]) {
  let p
  do { p={x:rnd(GRID),y:rnd(GRID)} } while(exclude.some(e=>e.x===p.x&&e.y===p.y))
  return p
}

const DIRS = {
  ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
  w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0},
}

function makeInitial() {
  const snake = [{x:9,y:9},{x:8,y:9},{x:7,y:9}]
  return {
    snake, dir:{x:1,y:0}, nextDir:{x:1,y:0},
    apple: rndPos(snake),
    voids: [],
    score:0, applesEaten:0,
    reversed:false,       // PERMANENT once flipped
    reversalCount:0,      // how many times reversed
    forgiveness:2,
    history:[],
    status:'playing',
  }
}

export default function Ekans({ gameState, onMove, playerRole, players, onRoundWin }) {
  const [local, setLocal]   = useState(null)
  const [phase, setPhase]   = useState('intro')
  const tickRef             = useRef(null)

  const myName  = players?.[playerRole]?.name  || `Player ${playerRole}`
  const myColor = players?.[playerRole]?.color || '#2471a3'
  const oppRole = playerRole==='X' ? 'O' : 'X'
  const oppName = players?.[oppRole]?.name || `Player ${oppRole}`

  function startGame() {
    const s = makeInitial()
    setLocal(s)
    setPhase('playing')
  }

  // ── Game tick ──
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      setLocal(prev => {
        if (!prev || prev.status !== 'playing') return prev
        const st = {...prev}

        // Apply direction — if reversed, flip it
        let d = st.reversed
          ? { x: -st.nextDir.x, y: -st.nextDir.y }
          : st.nextDir
        // Prevent 180-turn relative to current dir
        if (d.x === -st.dir.x && d.y === -st.dir.y) d = st.dir
        st.dir = d

        const head = {
          x:(st.snake[0].x + d.x + GRID) % GRID,
          y:(st.snake[0].y + d.y + GRID) % GRID,
        }
        const newSnake = [head, ...st.snake]

        st.history = [...(st.history||[]).slice(-6), st.snake.map(p=>({...p}))]

        // Void tile — teleport
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
            return {...st, snake:prev3, forgiveness:st.forgiveness-1, nextDir:st.dir}
          }
          return {...st, snake:st.snake, status:'dead'}
        }

        // Apple
        let score=st.score, eaten=st.applesEaten, growing=false
        let reversed=st.reversed, reversalCount=st.reversalCount

        if (head.x===st.apple.x && head.y===st.apple.y) {
          score++; eaten++; growing=true
          st.apple = rndPos(newSnake)

          // Every 5th apple: PERMANENTLY reverse controls
          if (eaten % 5 === 0) {
            reversed = !reversed  // toggle — so 5th, 10th, 15th flip again
            reversalCount++
          }

          // Every 7th apple: void tile
          if (eaten % 7 === 0) {
            const nv = rndPos([...newSnake, st.apple, ...(st.voids||[])])
            st.voids = [...(st.voids||[]).slice(-2), nv]
          }
        }
        if (!growing) newSnake.pop()

        return {...st, snake:newSnake, score, applesEaten:eaten, reversed, reversalCount}
      })
    }, TICK)
    return () => clearInterval(tickRef.current)
  }, [phase])

  // Keyboard
  useEffect(() => {
    if (phase !== 'playing') return
    function onKey(e) {
      const d = DIRS[e.key] || DIRS[e.key.toLowerCase()]
      if (d) { e.preventDefault(); setLocal(prev=>prev?{...prev,nextDir:d}:prev) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  useEffect(() => {
    if (local?.status==='dead') { clearInterval(tickRef.current); setPhase('dead') }
  }, [local?.status])

  function handleSubmit() {
    const s = local?.score || 0
    const cur = gameState || {}
    const newGs = {...cur, [`score${playerRole}`]:s, [`submitted${playerRole}`]:true}
    onMove(newGs)
    if (newGs.submittedX && newGs.submittedO && onRoundWin) {
      onRoundWin((newGs.scoreX||0) >= (newGs.scoreO||0) ? 'X' : 'O')
    }
    setPhase('submitted')
  }

  function tapDir(key) {
    const d = DIRS[key]
    if (d) setLocal(prev=>prev?{...prev,nextDir:d}:prev)
  }

  const snakeSet = new Set((local?.snake||[]).map(p=>`${p.x},${p.y}`))
  const isHead   = local?.snake?.[0]
  const voidSet  = new Set((local?.voids||[]).map(p=>`${p.x},${p.y}`))
  const xScore   = gameState?.[`scoreX`] ?? null
  const oScore   = gameState?.[`scoreO`] ?? null

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

      {/* Reversal status banner — PERMANENT */}
      {phase==='playing' && local?.reversed && (
        <div className="ekans-badge ekans-badge--chaos">
          <i className="bx bx-transfer" />
          Controls PERMANENTLY REVERSED
          <span className="ekans-badge-count">×{local.reversalCount}</span>
        </div>
      )}
      {phase==='playing' && local?.forgiveness > 0 && (
        <div className="ekans-badge ekans-badge--life">
          <i className="bx bx-heart" /> ×{local.forgiveness} forgiveness moves left
        </div>
      )}

      {/* Intro */}
      {phase==='intro' && (
        <div className="ekans-overlay">
          <p className="ekans-overlay-text">Each player plays solo. Higher score wins!</p>
          <div className="ekans-twists">
            <div className="ekans-twist"><i className="bx bx-transfer" /><span>Every 5th apple <strong>permanently reverses</strong> your controls (toggles each 5th)</span></div>
            <div className="ekans-twist"><i className="bx bx-ghost" /><span>Void tiles teleport your snake</span></div>
            <div className="ekans-twist"><i className="bx bx-undo" /><span>Collide? {local?.forgiveness||2} forgiveness moves rewind you</span></div>
          </div>
          <p className="ekans-controls-hint">Controls: Arrow keys or WASD</p>
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
            const isSnk = snakeSet.has(key)
            const isHd  = isHead?.x===x && isHead?.y===y
            const isApl = local?.apple?.x===x && local?.apple?.y===y
            const isVd  = voidSet.has(key)
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
          <button className="dpad-btn dpad-up"    onClick={()=>tapDir('ArrowUp')}><i className="bx bx-up-arrow-alt"/></button>
          <button className="dpad-btn dpad-left"  onClick={()=>tapDir('ArrowLeft')}><i className="bx bx-left-arrow-alt"/></button>
          <button className="dpad-btn dpad-right" onClick={()=>tapDir('ArrowRight')}><i className="bx bx-right-arrow-alt"/></button>
          <button className="dpad-btn dpad-down"  onClick={()=>tapDir('ArrowDown')}><i className="bx bx-down-arrow-alt"/></button>
          {local?.reversed && (
            <div className="dpad-reversed-hint">⚠ reversed!</div>
          )}
        </div>
      )}

      {/* Death screen */}
      {phase==='dead' && (
        <div className="ekans-dead">
          <p className="ekans-dead-title">Game Over!</p>
          <p className="ekans-dead-score">You scored <strong>{local?.score}</strong> points</p>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <i className="bx bx-check-circle" /> Submit Score
          </button>
        </div>
      )}

      {/* Submitted */}
      {phase==='submitted' && (
        <div className="ekans-submitted">
          <i className="bx bx-check-circle" style={{fontSize:'2rem',color:'var(--green-mid)'}}/>
          <p>Score submitted: <strong>{local?.score}</strong></p>
          <p className="ekans-waiting"><span className="blink-dot" style={{marginRight:6}} /> Waiting for {oppName} to finish...</p>
          {xScore!==null && oScore!==null && (
            <div className="ekans-result">
              <strong>{(xScore||0)>=(oScore||0)?players?.X?.name||'P1':players?.O?.name||'P2'}</strong> wins the round!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EScoreChip({role,players,score,submitted,localScore,playerRole,phase}) {
  const info  = players?.[role]
  const isMe  = playerRole===role
  const disp  = submitted ? `Score: ${score}` : isMe&&phase==='playing' ? `Score: ${localScore||0}` : '?'
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
