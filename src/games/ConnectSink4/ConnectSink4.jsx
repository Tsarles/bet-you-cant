// games/ConnectSink4/ConnectSink4.jsx
// Chaotic Connect 4: every 3rd move, a random column shifts!

import { useState, useEffect } from 'react'
import './ConnectSink4.css'

const ROWS = 6, COLS = 7

function dropToken(board, col, player) {
  const b = [...board]
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!b[r * COLS + col]) { b[r * COLS + col] = player; return { board: b, row: r } }
  }
  return { board: b, row: -1 } // full
}

function shiftColumn(board, col, dir) {
  // dir: 'down' (add empty at top, bottom falls off) or 'up' (add empty at bottom, top falls off)
  const b = [...board]
  const col_vals = Array.from({ length: ROWS }, (_, r) => b[r * COLS + col])
  const shifted  = dir === 'down'
    ? [null, ...col_vals.slice(0, ROWS - 1)]
    : [...col_vals.slice(1), null]
  for (let r = 0; r < ROWS; r++) b[r * COLS + col] = shifted[r]
  return b
}

function checkWinner(board) {
  const lines = []
  // horizontal
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS-4; c++) {
      const i = r*COLS+c; lines.push([i,i+1,i+2,i+3])
    }
  // vertical
  for (let r = 0; r <= ROWS-4; r++)
    for (let c = 0; c < COLS; c++) {
      const i = r*COLS+c; lines.push([i,i+COLS,i+2*COLS,i+3*COLS])
    }
  // diag down-right
  for (let r = 0; r <= ROWS-4; r++)
    for (let c = 0; c <= COLS-4; c++) {
      const i = r*COLS+c; lines.push([i,i+COLS+1,i+2*(COLS+1),i+3*(COLS+1)])
    }
  // diag down-left
  for (let r = 0; r <= ROWS-4; r++)
    for (let c = 3; c < COLS; c++) {
      const i = r*COLS+c; lines.push([i,i+COLS-1,i+2*(COLS-1),i+3*(COLS-1)])
    }
  for (const [a,b,c,d] of lines) {
    if (board[a] && board[a]===board[b] && board[a]===board[c] && board[a]===board[d])
      return { winner: board[a], line: [a,b,c,d] }
  }
  return null
}

export default function ConnectSink4({ gameState, onMove, playerRole, players, onRoundWin }) {
  const [chaosMsg, setChaosMsg] = useState(null)
  const [dropCol,  setDropCol]  = useState(null)

  const {
    board       = Array(ROWS * COLS).fill(null),
    xMoveCount  = 0,
    oMoveCount  = 0,
    currentTurn = 'X',
    winner      = null,
    winLine     = [],
    lastShiftCol = null,
  } = gameState

  const myTurn   = playerRole === currentTurn && !winner
  const xColor   = players?.X?.color || '#c0392b'
  const oColor   = players?.O?.color || '#2471a3'
  const myColor  = playerRole === 'X' ? xColor : oColor

  function isColFull(col) {
    return !!board[0 * COLS + col]
  }

  function handleDrop(col) {
    if (!myTurn || isColFull(col) || winner) return

    let newBoard = [...board]
    let newXCount = xMoveCount, newOCount = oMoveCount

    // Drop token
    const { board: b2 } = dropToken(newBoard, col, currentTurn)
    newBoard = b2
    if (currentTurn === 'X') newXCount++; else newOCount++

    // Chaos: every 3rd move, shift a random column
    const moveCount = currentTurn === 'X' ? newXCount : newOCount
    let shiftedCol = null
    if (moveCount % 3 === 0) {
      // Find non-full columns (that aren't our drop column if possible)
      const candidates = Array.from({ length: COLS }, (_, i) => i)
        .filter(c => newBoard.some((v, idx) => Math.floor(idx/COLS) > 0 && idx % COLS === c && v))
      if (candidates.length > 0) {
        shiftedCol = candidates[Math.floor(Math.random() * candidates.length)]
        const dir  = Math.random() > 0.5 ? 'down' : 'up'
        newBoard   = shiftColumn(newBoard, shiftedCol, dir)
        setChaosMsg(`CHAOS! Column ${shiftedCol+1} shifted ${dir}!`)
        setTimeout(() => setChaosMsg(null), 2400)
      }
    }

    const result = checkWinner(newBoard)
    const draw   = !result && newBoard.every(Boolean)

    const nextState = {
      board: newBoard,
      xMoveCount: newXCount,
      oMoveCount: newOCount,
      currentTurn: currentTurn === 'X' ? 'O' : 'X',
      winner: result ? result.winner : draw ? 'draw' : null,
      winLine: result ? result.line : [],
      lastShiftCol: shiftedCol,
    }
    onMove(nextState)
    if (result && onRoundWin) onRoundWin(result.winner)
  }

  function handleReset() {
    setChaosMsg(null); setDropCol(null)
    onMove({
      board: Array(ROWS * COLS).fill(null),
      xMoveCount: 0, oMoveCount: 0,
      currentTurn: 'X', winner: null, winLine: [], lastShiftCol: null,
    })
  }

  const getColor = v => v === 'X' ? xColor : v === 'O' ? oColor : null

  let status
  if (winner === 'draw') status = "It's a draw!"
  else if (winner) status = `${players?.[winner]?.name || `Player ${winner}`} wins the round!`
  else status = myTurn ? `Your turn — drop in a column` : `Waiting for ${players?.[currentTurn]?.name || `Player ${currentTurn}`}...`

  return (
    <div className="c4-wrapper">
      {/* Players */}
      <div className="c4-players">
        <C4Chip name={players?.X?.name||'P1'} color={xColor} symbol="X" active={currentTurn==='X'&&!winner} isMe={playerRole==='X'} moves={xMoveCount} />
        <span className="c4-vs">VS</span>
        <C4Chip name={players?.O?.name||'P2'} color={oColor} symbol="O" active={currentTurn==='O'&&!winner} isMe={playerRole==='O'} moves={oMoveCount} />
      </div>

      <div className={`c4-status ${winner ? 'c4-status--winner' : ''}`}>{status}</div>
      <p className="c4-hint"><i className="bx bx-shuffle" /> Every 3rd move shifts a random column!</p>

      {/* Chaos alert */}
      {chaosMsg && <div className="c4-chaos-alert"><i className="bx bx-error" /> {chaosMsg}</div>}

      {/* Column hover buttons */}
      <div className="c4-col-headers">
        {Array.from({length:COLS},(_,c)=>(
          <button
            key={c}
            className={`c4-col-btn ${myTurn&&!isColFull(c)&&!winner?'c4-col-btn--active':''} ${dropCol===c?'c4-col-btn--hover':''} ${lastShiftCol===c?'c4-col-btn--shifted':''}`}
            onClick={()=>handleDrop(c)}
            onMouseEnter={()=>setDropCol(c)}
            onMouseLeave={()=>setDropCol(null)}
            disabled={!myTurn||isColFull(c)||!!winner}
            title={`Drop in column ${c+1}`}
          >
            {myTurn && !isColFull(c) && !winner && dropCol===c
              ? <div className="c4-ghost-token" style={{background:myColor}} />
              : <i className="bx bx-chevron-down" />
            }
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="c4-board">
        {Array.from({length:ROWS},(_,r)=>
          Array.from({length:COLS},(_,c)=>{
            const idx   = r*COLS+c
            const val   = board[idx]
            const isWin = winLine.includes(idx)
            const color = getColor(val)
            return (
              <div
                key={idx}
                className={`c4-cell ${val?'c4-cell--filled':''} ${isWin?'c4-cell--win':''} ${lastShiftCol===c?'c4-cell--shifted':''} ${!val&&myTurn&&dropCol===c&&!winner?'c4-cell--preview':''}`}
              >
                {val && (
                  <div
                    className={`c4-token ${isWin?'c4-token--win':''}`}
                    style={{ background: color, boxShadow: isWin ? `0 0 0 3px ${color}, 2px 2px 0 var(--ink)` : '2px 2px 0 var(--ink)' }}
                  >
                    <span>{val}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {winner && (
        <button className="btn btn-ink c4-reset" onClick={handleReset}>
          <i className="bx bx-refresh" /> Next Round
        </button>
      )}
    </div>
  )
}

function C4Chip({ name, color, symbol, active, isMe, moves }) {
  return (
    <div className={`c4-chip ${active?'c4-chip--active':''}`} style={active?{borderColor:color,boxShadow:`4px 4px 0 ${color}`}:{}}>
      <div className="c4-chip-token" style={{background:color}}>{symbol}</div>
      <div className="c4-chip-info">
        <span className="c4-chip-name">{isMe?'You':name}</span>
        <span className="c4-chip-moves">{moves} moves</span>
      </div>
      {active && <span className="c4-chip-dot" style={{background:color}} />}
    </div>
  )
}
