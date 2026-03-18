// components/GameCard.jsx — wireframe style: icon box + name + "click for description"

import { useState } from 'react'
import './GameCard.css'

export default function GameCard({ game, selected, onSelect }) {
  const [showDesc, setShowDesc] = useState(false)

  function handleClick() {
    onSelect(game)
  }

  return (
    <div className={`game-card ${selected ? 'game-card--selected' : ''}`}>
      {/* Clickable main tile */}
      <button className="game-card__tile" onClick={handleClick} aria-pressed={selected}>
        {/* Icon box — matches wireframe top-left small box */}
        <div className="game-card__icon-box">
          <i className={`bx ${game.bxIcon} game-card__icon`} />
        </div>
        <div className="game-card__info">
          <h3 className="game-card__name">{game.name}</h3>
          <button
            className="game-card__desc-toggle"
            onClick={e => { e.stopPropagation(); setShowDesc(v => !v) }}
          >
            <i className={`bx ${showDesc ? 'bx-chevron-up' : 'bx-info-circle'}`} />
            {showDesc ? 'Hide' : 'Click for description'}
          </button>
        </div>
        {selected && (
          <span className="game-card__check"><i className="bx bx-check" /></span>
        )}
      </button>

      {/* Expandable description */}
      {showDesc && (
        <div className="game-card__desc animate-fade">
          {game.description}
        </div>
      )}
    </div>
  )
}
