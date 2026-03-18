// ConnectSink4 — Chaotic Connect 4
// Better mechanics: landing preview, drop animation, shake shift, win flash
// Every 3rd move per player: a random column shifts

import { useState, useRef } from 'react'
import './ConnectSink4.css'

const ROWS = 6, COLS = 7

function emptyBoard() { return Array(ROWS * COLS).fill(null) }

function getDropRow(board, col) {
  for (let r = ROWS-1; r >= 0; r--) {
    if (!board[r*COLS+col]) return r
  }
  return -1  // full
}

function dropToken(board, col, player) {
  const b = [...board]
  const r = getDropRow(b, col)
  if (r < 0) return { board:b, row:-1 }
  b[r*COLS+col] = player
  return { board:b, row:r }
}

function shiftColumn(board, col, dir) {
  const b = [...board]
  const vals = Array.from({length:ROWS}, (_,r) => b[r*COLS+col])
  const shifted = dir==='down'
    ? [null, ...vals.slice(0,ROWS-1)]
    : [...vals.slice(1), null]
  for (let r=0;r<ROWS;r++) b[r*COLS+col] = shifted[r]
  return b
}

function checkWinner(board) {
  const lines = []
  for (let r=0;r<ROWS;r++)
    for (let c=0;c<=COLS-4;c++) { const i=r*COLS+c; lines.push([i,i+1,i+2,i+3]) }
  for (let r=0;r<=ROWS-4;r++)
    for (let c=0;c<COLS;c++) { const i=r*COLS+c; lines.push([i,i+COLS,i+2*COLS,i+3*COLS]) }
  for (let r=0;r<=ROWS-4;r++)
    for (let c=0;c<=COLS-4;c++) { const i=r*COLS+c; lines.push([i,i+COLS+1,i+2*(COLS+1),i+3*(COLS+1)]) }
  for (let r=0;r<=ROWS-4;r++)
    for (let c=3;c<COLS;c++) { const i=r*COLS+c; lines.push([i,i+COLS-1,i+2*(COLS-1),i+3*(COLS-1)]) }
  for (const [a,b,c,d] of lines)
    if (board[a] && board[a]===board[b] && board[a]===board[c] && board[a]===board[d])
      return { winner:board[a], line:[a,b,c,d] }
  return null
}

export default function ConnectSink4({ gameState, onMove, playerRole, players, onRoundWin }) {
  const [hoverCol,  setHoverCol]  = useState(null)
  const [dropping,  setDropping]  = useState(null) // { col, row, player }
  const [shaking,   setShaking]   = useState(null) // col that shifted
  const [chaosMsg,  setChaosMsg]  = useState(null)

  const {
    board        = emptyBoard(),
    xMoveCount   = 0,
    oMoveCount   = 0,
    currentTurn  = 'X',
    winner       = null,
    winLine      = [],
    lastShiftCol = null,
  } = gameState

  const myTurn  = playerRole === currentTurn && !winner
  const xColor  = players?.X?.color || '#c0392b'
  const oColor  = players?.O?.color || '#2471a3'
  const myColor = playerRole==='X' ? xColor : oColor

  function isColFull(col) { return getDropRow(board, col) < 0 }

  // Landing row preview: which row would a token land in
  function getLandingRow(col) { return getDropRow(board, col) }

  async function handleDrop(col) {
    if (!myTurn || isColFull(col) || winner) return

    let newBoard    = [...board]
    let newXCount   = xMoveCount
    let newOCount   = oMoveCount

    const { board:b2, row } = dropToken(newBoard, col, currentTurn)
    if (row < 0) return
    newBoard = b2

    // Animate drop
    setDropping({ col, row, player: currentTurn })
    await new Promise(r => setTimeout(r, 320))
    setDropping(null)

    if (currentTurn==='X') newXCount++; else newOCount++

    // Chaos every 3rd move per player
    const myMoves = currentTurn==='X' ? newXCount : newOCount
    let shiftedCol = null
    if (myMoves % 3 === 0) {
      // Pick a non-empty column to shift (prefer not the one just dropped)
      const candidates = Array.from({length:COLS},(_,i)=>i)
        .filter(c => newBoard.some((_,idx) => idx%COLS===c && newBoard[idx]))
      if (candidates.length > 0) {
        shiftedCol = candidates[Math.floor(Math.random()*candidates.length)]
        const dir  = Math.random() > 0.5 ? 'down' : 'up'
        newBoard   = shiftColumn(newBoard, shiftedCol, dir)
        setShaking(shiftedCol)
        setChaosMsg(`Column ${shiftedCol+1} shifted ${dir}!`)
        setTimeout(() => { setShaking(null); setChaosMsg(null) }, 1400)
      }
    }

    const result = checkWinner(newBoard)
    const draw   = !result && newBoard.every(Boolean)

    const next = {
      board:       newBoard,
      xMoveCount:  newXCount,
      oMoveCount:  newOCount,
      currentTurn: currentTurn==='X' ? 'O' : 'X',
      winner:      result ? result.winner : draw ? 'draw' : null,
      winLine:     result ? result.line : [],
      lastShiftCol: shiftedCol,
    }
    onMove(next)
    if (result && onRoundWin) onRoundWin(result.winner)
  }

  function handleReset() {
    setDropping(null); setShaking(null); setChaosMsg(null); setHoverCol(null)
    onMove({
      board:emptyBoard(), xMoveCount:0, oMoveCount:0,
      currentTurn:'X', winner:null, winLine:[], lastShiftCol:null,
    })
  }

  const getColor = v => v==='X' ? xColor : v==='O' ? oColor : null

  let status
  if (winner==='draw') status = "It's a draw!"
  else if (winner)     status = `${players?.[winner]?.name||`Player ${winner}`} wins the round!`
  else status = myTurn
    ? `Your turn — drop in a column`
    : `Waiting for ${players?.[currentTurn]?.name||`Player ${currentTurn}`}...`

  const xNext = xMoveCount > 0 && xMoveCount % 3 === 2 && !winner
  const oNext = oMoveCount > 0 && oMoveCount % 3 === 2 && !winner

  return (
    <div className="c4-wrapper">
      {/* Players */}
      <div className="c4-players">
        <C4Chip
          name={players?.X?.name||'P1'} color={xColor} symbol="X"
          active={currentTurn==='X'&&!winner} isMe={playerRole==='X'}
          moves={xMoveCount} chaosNext={xNext}
        />
        <span className="c4-vs">VS</span>
        <C4Chip
          name={players?.O?.name||'P2'} color={oColor} symbol="O"
          active={currentTurn==='O'&&!winner} isMe={playerRole==='O'}
          moves={oMoveCount} chaosNext={oNext}
        />
      </div>

      <div className={`c4-status ${winner?'c4-status--winner':''}`}>{status}</div>

      {/* Chaos alert */}
      {chaosMsg && (
        <div className="c4-chaos-alert">
          <i className="bx bx-error" /> CHAOS! {chaosMsg}
        </div>
      )}

      <p className="c4-hint">
        <i className="bx bx-info-circle" /> Every 3rd move shifts a random column!
      </p>

      {/* Column drop buttons with preview */}
      <div className="c4-col-headers" style={{'--cols':COLS}}>
        {Array.from({length:COLS},(_,c) => {
          const landRow  = getLandingRow(c)
          const canDrop  = myTurn && !isColFull(c) && !winner
          return (
            <button
              key={c}
              className={[
                'c4-col-btn',
                canDrop ? 'c4-col-btn--active' : '',
                shaking===c ? 'c4-col-btn--shaking' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleDrop(c)}
              onMouseEnter={() => canDrop && setHoverCol(c)}
              onMouseLeave={() => setHoverCol(null)}
              disabled={!canDrop}
              aria-label={`Drop in column ${c+1}`}
            >
              {canDrop && hoverCol===c
                ? <div className="c4-ghost-token" style={{background:myColor, borderColor:myColor}} />
                : <i className={`bx ${canDrop ? 'bx-chevron-down' : isColFull(c) ? 'bx-x' : 'bx-minus'}`} />
              }
            </button>
          )
        })}
      </div>

      {/* Board */}
      <div className="c4-board" style={{'--cols':COLS,'--rows':ROWS}}>
        {Array.from({length:ROWS},(_,r) =>
          Array.from({length:COLS},(_,c) => {
            const idx    = r*COLS+c
            const val    = board[idx]
            const isWin  = winLine.includes(idx)
            const color  = getColor(val)
            // Preview: highlight landing cell
            const isPreview = !val && hoverCol===c && getLandingRow(board,c)===r && myTurn && !winner
            // Drop animation
            const isDrop = dropping && dropping.col===c && dropping.row===r
            // Shake animation
            const isShake = shaking===c

            return (
              <div
                key={idx}
                className={[
                  'c4-cell',
                  val  ? 'c4-cell--filled' : '',
                  isWin ? 'c4-cell--win' : '',
                  isPreview ? 'c4-cell--preview' : '',
                  isShake ? 'c4-cell--shaking' : '',
                ].filter(Boolean).join(' ')}
                style={{'--drop-rows': dropping?.row + 1}}
              >
                {val && (
                  <div
                    className={`c4-token ${isDrop?'c4-token--drop':''} ${isWin?'c4-token--win':''}`}
                    style={{
                      background: color,
                      borderColor: color,
                      boxShadow: isWin
                        ? `0 0 0 3px ${color}, 3px 3px 0 var(--ink)`
                        : '2px 2px 0 var(--ink)',
                    }}
                  />
                )}
                {isPreview && (
                  <div className="c4-preview-dot" style={{background:myColor, opacity:0.35}} />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Move counters */}
      <div className="c4-move-row">
        <span className="c4-move-info" style={{color:xColor}}>
          X: {xMoveCount} moves {xNext ? '⚡ chaos next!' : `(chaos in ${3-(xMoveCount%3)} move${3-(xMoveCount%3)!==1?'s':''})`}
        </span>
        <span className="c4-move-info" style={{color:oColor}}>
          O: {oMoveCount} moves {oNext ? '⚡ chaos next!' : `(chaos in ${3-(oMoveCount%3)} move${3-(oMoveCount%3)!==1?'s':''})`}
        </span>
      </div>

      {winner && (
        <button className="btn btn-ink c4-reset" onClick={handleReset}>
          <i className="bx bx-refresh" /> Next Round
        </button>
      )}
    </div>
  )
}

function C4Chip({ name, color, symbol, active, isMe, moves, chaosNext }) {
  return (
    <div
      className={`c4-chip ${active?'c4-chip--active':''} ${chaosNext?'c4-chip--chaos-next':''}`}
      style={active ? {borderColor:color, boxShadow:`4px 4px 0 ${color}`, background:`${color}18`} : {}}
    >
      <div className="c4-chip-token" style={{background:color}}>{symbol}</div>
      <div className="c4-chip-info">
        <span className="c4-chip-name">{isMe?'You':name}</span>
        <span className="c4-chip-moves">
          {moves} moves
          {chaosNext && <span className="c4-chip-chaos-tag">⚡ chaos!</span>}
        </span>
      </div>
      {active && <span className="c4-chip-dot" style={{background:color}} />}
    </div>
  )
}
