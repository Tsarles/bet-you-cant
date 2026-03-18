// components/GameOver.jsx — Series end screen with confetti + side-switch info

import { useEffect, useRef } from 'react'
import './GameOver.css'

export default function GameOver({ winner, loser, scores, dare, dareType, onPlayAgain, onHome }) {
  const canvasRef = useRef(null)

  // Simple confetti
  useEffect(() => {
    const canvas  = canvasRef.current
    if (!canvas) return
    const ctx     = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const COLORS  = [winner.color, '#f7f4ec', '#2d7a14', '#d35400', '#7d3c98']
    const pieces  = Array.from({ length: 80 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * -canvas.height,
      w:    6 + Math.random() * 8,
      h:    10 + Math.random() * 6,
      rot:  Math.random() * 360,
      spin: (Math.random() - 0.5) * 6,
      vy:   2 + Math.random() * 3,
      vx:   (Math.random() - 0.5) * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    let raf
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.y   += p.vy
        p.x   += p.vx
        p.rot += p.spin
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [winner.color])

  return (
    <div className="gameover">
      <canvas ref={canvasRef} className="gameover__confetti" />

      <div className="gameover__card">
        {/* Winner */}
        <div className="gameover__winner-badge" style={{ borderColor: winner.color, boxShadow: `8px 8px 0 ${winner.color}` }}>
          <div className="gameover__winner-token" style={{ background: winner.color }}>
            {winner.symbol}
          </div>
          <div>
            <p className="gameover__winner-label">WINNER</p>
            <p className="gameover__winner-name">{winner.name}</p>
          </div>
          <i className="bx bx-party gameover__party-icon" />
        </div>

        {/* Score */}
        <div className="gameover__score">
          <div className="gameover__score-chip" style={{ borderColor: winner.color }}>
            <span className="gameover__score-num" style={{ color: winner.color }}>{scores[winner.symbol]}</span>
            <span className="gameover__score-label">{winner.name}</span>
          </div>
          <span className="gameover__score-vs">—</span>
          <div className="gameover__score-chip">
            <span className="gameover__score-num">{scores[loser.symbol]}</span>
            <span className="gameover__score-label">{loser.name}</span>
          </div>
        </div>

        {/* Dare outcome */}
        {dare && dareType !== 'none' && (
          <div className="gameover__dare">
            <i className="bx bx-target-lock" />
            <div>
              <p className="gameover__dare-label">
                {dareType === 'dare' ? 'Dare' : dareType === 'bet' ? 'Bet' : 'Truth'} — {loser.name} has to:
              </p>
              <p className="gameover__dare-text">"{dare}"</p>
            </div>
          </div>
        )}

        {/* Side switch notice */}
        <div className="gameover__switch-notice">
          <i className="bx bx-transfer" />
          <p>Sides will switch next game — <strong>{loser.name}</strong> will go first as X!</p>
        </div>

        {/* Actions */}
        <div className="gameover__actions">
          <button className="btn btn-primary gameover__play-again" onClick={onPlayAgain}>
            <i className="bx bx-refresh" /> Play Again
          </button>
          <button className="btn btn-ghost" onClick={onHome}>
            <i className="bx bx-home" /> Home
          </button>
        </div>

        <p className="gameover__credit">© 2026 Bet You Can't · @Tsarles</p>
      </div>
    </div>
  )
}
