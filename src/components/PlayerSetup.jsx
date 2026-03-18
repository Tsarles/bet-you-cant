// components/PlayerSetup.jsx — name + color picker

import { PLAYER_COLORS } from '../utils/sessionStore'
import './PlayerSetup.css'

export default function PlayerSetup({ value, onChange, label = 'Your Name' }) {
  return (
    <div className="player-setup">
      <div className="player-setup__name">
        <label className="ps-label">
          <i className="bx bx-user" /> {label}
        </label>
        <input
          className="input"
          placeholder="Enter your name..."
          value={value.name}
          maxLength={18}
          onChange={e => onChange({ ...value, name: e.target.value })}
        />
      </div>

      <div className="player-setup__color">
        <label className="ps-label">
          <i className="bx bx-palette" /> Pick your token color
        </label>
        <div className="ps-swatches">
          {PLAYER_COLORS.map(c => (
            <button
              key={c.value}
              className={`ps-swatch ${value.color === c.value ? 'ps-swatch--active' : ''}`}
              style={{ background: c.value }}
              title={c.label}
              onClick={() => onChange({ ...value, color: c.value })}
              type="button"
            >
              {value.color === c.value && <i className="bx bx-check" />}
            </button>
          ))}
        </div>
        <div className="ps-preview">
          <div className="ps-token" style={{ background: value.color, borderColor: value.color }}>
            {value.name ? value.name[0].toUpperCase() : '?'}
          </div>
          <span className="ps-preview-label">{value.name || 'No name'}</span>
        </div>
      </div>
    </div>
  )
}
