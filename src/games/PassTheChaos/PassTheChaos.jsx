// games/PassTheChaos/PassTheChaos.jsx
// Players take turns picking numbered tiles.
// Tiles have hidden effects: Reverse, Skip, Repeat, Snake Jump, Dare Tile.

import { useState } from 'react'
import './PassTheChaos.css'

const TILE_TYPES = [
  { type:'normal',  label:'Normal',    icon:'bx-circle',     weight:10 },
  { type:'reverse', label:'Reverse!',  icon:'bx-transfer',   weight:3  },
  { type:'skip',    label:'Skip!',     icon:'bx-skip-next',  weight:3  },
  { type:'repeat',  label:'Again!',    icon:'bx-rotate-right',weight:2 },
  { type:'snake',   label:'Snake Jump',icon:'bx-shuffle',    weight:2  },
  { type:'dare',    label:'Dare Tile', icon:'bx-target-lock',weight:2  },
  { type:'bonus',   label:'+2 Points', icon:'bx-star',       weight:2  },
]

function weightedRandom(types) {
  const total = types.reduce((s,t)=>s+t.weight,0)
  let r = Math.random()*total
  for (const t of types) { r-=t.weight; if(r<=0) return t.type }
  return 'normal'
}

function buildTiles(count=16) {
  return Array.from({length:count},(_,i)=>({
    id:i,
    number:i+1,
    type: weightedRandom(TILE_TYPES),
    revealed:false,
    owner:null,
  }))
}

const EFFECT_MESSAGES = {
  reverse: (names, cur) => `🔀 Reverse! Turn order flipped — ${names[cur]} goes again!`,
  skip:    (names, cur, next) => `⏭ Skip! ${names[next]}'s turn is skipped!`,
  repeat:  (names, cur) => `🔁 Repeat! ${names[cur]} picks again!`,
  snake:   (names, cur) => `🐍 Snake Jump! ${names[cur]} jumps to a random unclaimed tile!`,
  dare:    (names, cur) => `🎯 Dare Tile! ${names[cur]} must do a dare!`,
  bonus:   (names, cur) => `⭐ Bonus! ${names[cur]} gets +2 extra points!`,
  normal:  (names, cur) => `${names[cur]} claimed tile — +1 point`,
}

export default function PassTheChaos({ gameState, onMove, playerRole, players, onRoundWin }) {
  const {
    tiles       = buildTiles(),
    scores      = { X:0, O:0 },
    currentTurn = 'X',
    order       = ['X','O'],     // can reverse
    message     = 'Pick a tile to start!',
    winner      = null,
    extraPick   = false,         // for repeat effect
    log         = [],
  } = gameState

  const myTurn  = playerRole === currentTurn && !winner
  const xColor  = players?.X?.color || '#c0392b'
  const oColor  = players?.O?.color || '#2471a3'
  const names   = {
    X: players?.X?.name || 'Player X',
    O: players?.O?.name || 'Player O',
  }

  function allClaimed() { return tiles.every(t=>t.revealed) }

  function handleTilePick(id) {
    if (!myTurn) return
    const tile = tiles.find(t=>t.id===id)
    if (!tile || tile.revealed) return

    let newTiles  = tiles.map(t=>t.id===id ? {...t, revealed:true, owner:currentTurn} : t)
    let newScores = {...scores}
    let newOrder  = [...order]
    let newTurn   = currentTurn
    let msg       = ''
    let newLog    = [...log]
    let newExtra  = false

    // Score the tile
    newScores[currentTurn] = (newScores[currentTurn]||0) + 1

    // Get next turn index
    const curIdx  = newOrder.indexOf(currentTurn)
    const nextIdx = (curIdx+1) % newOrder.length
    const nextP   = newOrder[nextIdx]

    switch(tile.type) {
      case 'normal':
        msg = EFFECT_MESSAGES.normal(names, currentTurn)
        newTurn = nextP
        break
      case 'reverse':
        newOrder = [...newOrder].reverse()
        msg = EFFECT_MESSAGES.reverse(names, currentTurn)
        newTurn = currentTurn // same player goes next since order flipped
        break
      case 'skip':
        msg = EFFECT_MESSAGES.skip(names, currentTurn, nextP)
        // Skip the next player — advance by 2
        const skipIdx = (newOrder.indexOf(currentTurn)+2) % newOrder.length
        newTurn = newOrder[skipIdx] || nextP
        break
      case 'repeat':
        msg = EFFECT_MESSAGES.repeat(names, currentTurn)
        newTurn = currentTurn
        newExtra = true
        break
      case 'snake': {
        // Find random unclaimed tile and reveal it for this player too
        const unclaimed = newTiles.filter(t=>!t.revealed)
        if (unclaimed.length > 0) {
          const jumped = unclaimed[Math.floor(Math.random()*unclaimed.length)]
          newTiles = newTiles.map(t=>t.id===jumped.id ? {...t,revealed:true,owner:currentTurn} : t)
          newScores[currentTurn]++
          msg = `${EFFECT_MESSAGES.snake(names, currentTurn)} Grabbed tile #${jumped.number} too!`
        } else {
          msg = EFFECT_MESSAGES.snake(names, currentTurn)
        }
        newTurn = nextP
        break
      }
      case 'dare':
        msg = EFFECT_MESSAGES.dare(names, currentTurn)
        newTurn = nextP
        break
      case 'bonus':
        newScores[currentTurn] = (newScores[currentTurn]||0) + 2 // +2 on top of +1 already added
        msg = EFFECT_MESSAGES.bonus(names, currentTurn)
        newTurn = nextP
        break
      default:
        newTurn = nextP
    }

    newLog = [msg, ...newLog.slice(0,4)]

    // Check if game over
    let newWinner = null
    if (allClaimed() || newTiles.every(t=>t.revealed)) {
      newWinner = newScores.X > newScores.O ? 'X'
                : newScores.O > newScores.X ? 'O'
                : 'draw'
    }

    const next = {
      tiles: newTiles, scores: newScores,
      currentTurn: newWinner ? currentTurn : newTurn,
      order: newOrder,
      message: msg,
      winner: newWinner,
      extraPick: newExtra,
      log: newLog,
    }
    onMove(next)
    if (newWinner && newWinner !== 'draw' && onRoundWin) onRoundWin(newWinner)
  }

  function handleReset() {
    onMove({
      tiles: buildTiles(),
      scores:{X:0,O:0}, currentTurn:'X', order:['X','O'],
      message:'Pick a tile to start!', winner:null, extraPick:false, log:[],
    })
  }

  const tileTypeInfo = (type) => TILE_TYPES.find(t=>t.type===type)

  return (
    <div className="ptc-wrapper">
      {/* Players */}
      <div className="ptc-players">
        <PtcChip name={names.X} color={xColor} symbol="X" score={scores.X} active={currentTurn==='X'&&!winner} isMe={playerRole==='X'} />
        <span className="ptc-vs">VS</span>
        <PtcChip name={names.O} color={oColor} symbol="O" score={scores.O} active={currentTurn==='O'&&!winner} isMe={playerRole==='O'} />
      </div>

      {/* Status */}
      <div className={`ptc-status ${winner?'ptc-status--winner':''}`}>
        {winner
          ? winner==='draw'
            ? "It's a draw!"
            : `${names[winner]} wins the round!`
          : myTurn ? `Your turn — pick a tile` : `Waiting for ${names[currentTurn]}...`
        }
      </div>

      {/* Turn indicator */}
      {!winner && (
        <div className="ptc-turn-indicator" style={{borderColor: currentTurn==='X' ? xColor : oColor}}>
          <div className="ptc-turn-token" style={{background: currentTurn==='X' ? xColor : oColor}}>
            {currentTurn}
          </div>
          <span>{names[currentTurn]}'s turn{extraPick?' — extra pick!':''}</span>
          {order[0]!=='X' && <span className="ptc-reversed-tag"><i className="bx bx-transfer"/> Reversed!</span>}
        </div>
      )}

      {/* Tile grid */}
      <div className="ptc-grid">
        {tiles.map(tile => {
          const info = tileTypeInfo(tile.type)
          const color = tile.owner==='X' ? xColor : tile.owner==='O' ? oColor : null
          return (
            <button
              key={tile.id}
              className={[
                'ptc-tile',
                tile.revealed ? 'ptc-tile--revealed' : '',
                !tile.revealed && myTurn ? 'ptc-tile--pickable' : '',
                tile.type!=='normal' && tile.revealed ? `ptc-tile--${tile.type}` : '',
              ].filter(Boolean).join(' ')}
              style={tile.revealed&&color ? {background:`${color}22`, borderColor:color} : {}}
              onClick={()=>handleTilePick(tile.id)}
              disabled={tile.revealed || !myTurn || !!winner}
            >
              {tile.revealed ? (
                <>
                  <i className={`bx ${info?.icon} ptc-tile-icon`} style={{color:color||'var(--ink-muted)'}} />
                  <span className="ptc-tile-type">{info?.label}</span>
                  <span className="ptc-tile-owner" style={{color}}>{tile.owner}</span>
                </>
              ) : (
                <span className="ptc-tile-num">{tile.number}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Event log */}
      {log.length > 0 && (
        <div className="ptc-log">
          {log.map((entry, i) => (
            <div key={i} className={`ptc-log-entry ${i===0?'ptc-log-entry--latest':''}`}>{entry}</div>
          ))}
        </div>
      )}

      {/* Tile legend */}
      <div className="ptc-legend">
        {TILE_TYPES.filter(t=>t.type!=='normal').map(t=>(
          <div key={t.type} className="ptc-legend-item">
            <i className={`bx ${t.icon}`} /> {t.label}
          </div>
        ))}
      </div>

      {winner && (
        <button className="btn btn-ink ptc-reset" onClick={handleReset}>
          <i className="bx bx-refresh" /> Next Round
        </button>
      )}
    </div>
  )
}

function PtcChip({ name, color, symbol, score, active, isMe }) {
  return (
    <div className="ptc-chip" style={active?{borderColor:color,boxShadow:`4px 4px 0 ${color}`,background:`${color}14`}:{}}>
      <div className="ptc-chip-token" style={{background:color}}>{symbol}</div>
      <div className="ptc-chip-info">
        <span className="ptc-chip-name">{isMe?'You':name}</span>
        <span className="ptc-chip-score">{score} pts</span>
      </div>
      {active && <span className="ptc-chip-dot" style={{background:color}} />}
    </div>
  )
}
