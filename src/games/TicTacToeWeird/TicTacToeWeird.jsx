// games/TicTacToeWeird/TicTacToeWeird.jsx — with player colors + onRoundWin

import { useState } from 'react'
import './TicTacToeWeird.css'

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES)
    if (board[a] && board[a]===board[b] && board[a]===board[c])
      return { winner: board[a], line: [a,b,c] }
  return null
}

export default function TicTacToeWeird({ gameState, onMove, playerRole, players, onRoundWin }) {
  const [fadingCell, setFadingCell]   = useState(null)
  const [placingCell, setPlacingCell] = useState(null)

  const { board=Array(9).fill(null), xMoves=[], oMoves=[], currentTurn='X', winner=null, winLine=[] } = gameState

  const myTurn = playerRole === currentTurn && !winner
  const xColor = players?.X?.color || '#c0392b'
  const oColor = players?.O?.color || '#2471a3'

  function handleCellClick(i) {
    if (!myTurn || board[i] || winner) return
    const nb = [...board], nX = [...xMoves], nO = [...oMoves]
    let disappearing = null
    if (currentTurn==='X' && nX.length>=3) { disappearing=nX.shift(); nb[disappearing]=null }
    if (currentTurn==='O' && nO.length>=3) { disappearing=nO.shift(); nb[disappearing]=null }
    nb[i] = currentTurn
    currentTurn==='X' ? nX.push(i) : nO.push(i)
    const result = checkWinner(nb)
    const nextState = { board:nb, xMoves:nX, oMoves:nO, currentTurn:currentTurn==='X'?'O':'X', winner:result?result.winner:null, winLine:result?result.line:[] }
    if (disappearing!==null) setFadingCell(disappearing)
    setPlacingCell(i); setTimeout(()=>{setFadingCell(null);setPlacingCell(null)},500)
    onMove(nextState)
    if (result && onRoundWin) onRoundWin(result.winner)
  }

  function handleReset() {
    setFadingCell(null); setPlacingCell(null)
    onMove({ board:Array(9).fill(null), xMoves:[], oMoves:[], currentTurn:'X', winner:null, winLine:[] })
  }

  let status
  if (winner==='draw') status = "It's a draw!"
  else if (winner) status = `${players?.[winner]?.name||`Player ${winner}`} wins the round!`
  else status = myTurn ? `Your turn — place your ${currentTurn}` : `Waiting for ${players?.[currentTurn]?.name||`Player ${currentTurn}`}...`

  return (
    <div className="ttt-wrapper">
      <div className="ttt-players">
        <PlayerChip symbol="X" name={players?.X?.name||'P1'} color={xColor} moveCount={xMoves.length} active={currentTurn==='X'&&!winner} isMe={playerRole==='X'} />
        <span className="ttt-vs">VS</span>
        <PlayerChip symbol="O" name={players?.O?.name||'P2'} color={oColor} moveCount={oMoves.length} active={currentTurn==='O'&&!winner} isMe={playerRole==='O'} />
      </div>

      <div className={`ttt-status ${winner?'ttt-status--winner':''}`}>{status}</div>
      <p className="ttt-rule-hint">On your <strong>4th move</strong>, your oldest mark disappears</p>

      <div className="ttt-board">
        {board.map((cell,i) => {
          const isFading  = fadingCell===i
          const isPlacing = placingCell===i
          const isWin     = winLine.includes(i)
          const willFade  = !winner && (
            (cell==='X'&&xMoves.length>=3&&xMoves[0]===i) ||
            (cell==='O'&&oMoves.length>=3&&oMoves[0]===i)
          )
          const cellColor = cell==='X' ? xColor : cell==='O' ? oColor : null
          return (
            <button
              key={i}
              className={['ttt-cell', cell?`ttt-cell--filled`:'', isFading?'ttt-cell--fading':'', isPlacing?'ttt-cell--placing':'', isWin?'ttt-cell--win':'', willFade?'ttt-cell--will-fade':'', !cell&&myTurn?'ttt-cell--hoverable':''].filter(Boolean).join(' ')}
              onClick={() => handleCellClick(i)}
              disabled={!!cell||!myTurn||!!winner}
              style={isWin&&cellColor?{borderColor:cellColor,boxShadow:`5px 5px 0 ${cellColor}`}:{}}
            >
              {cell && (
                <span className="ttt-symbol" style={{ color: cellColor }}>{cell}</span>
              )}
              {willFade && !winner && <span className="ttt-vanish-badge">next</span>}
            </button>
          )
        })}
      </div>

      {winner && (
        <button className="btn btn-ink ttt-reset" onClick={handleReset}>
          <i className="bx bx-refresh" /> Next Round
        </button>
      )}
    </div>
  )
}

function PlayerChip({ symbol, name, color, moveCount, active, isMe }) {
  return (
    <div className="ttt-player-chip" style={active?{borderColor:color,boxShadow:`4px 4px 0 ${color}`,background:`${color}14`}:{}}>
      <span className="chip-symbol" style={{color}}>{symbol}</span>
      <div className="chip-info">
        <span className="chip-label">{isMe?'You':name}</span>
        <span className="chip-moves">{moveCount} move{moveCount!==1?'s':''}</span>
      </div>
      {active && <span className="chip-turn-dot" style={{background:color,borderColor:color}} />}
    </div>
  )
}
