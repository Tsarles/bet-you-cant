// pages/Landing.jsx — floating doodle cards with icons, privacy note, ownership

import { useNavigate } from 'react-router-dom'
import './Landing.css'

// Each floating doodle card: icon + label
const DOODLE_CARDS = [
  { icon: 'bx-grid-alt',    label: 'Three Tac Toe',     cls: 'fc-1' },
  { icon: 'bx-dots-horizontal-rounded', label: 'Connect 4', cls: 'fc-2' },
  { icon: 'bx-cycling',     label: 'Ekans',              cls: 'fc-3' },
  { icon: 'bx-shuffle',     label: 'Pass the Chaos',     cls: 'fc-4' },
  { icon: 'bx-trophy',      label: '',                   cls: 'fc-5 fc-small' },
  { icon: 'bx-dice-5',      label: '',                   cls: 'fc-6 fc-small' },
  { icon: 'bx-joystick',    label: '',                   cls: 'fc-7 fc-tiny' },
  { icon: 'bx-target-lock', label: '',                   cls: 'fc-8 fc-tiny' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing" onClick={() => navigate('/home')}>

      {/* ── Floating doodle cards ── */}
      {DOODLE_CARDS.map((card, i) => (
        <div
          key={i}
          className={`fl-card ${card.cls}`}
          title={card.label || undefined}
        >
          <i className={`bx ${card.icon} fl-card__icon`} />
          {card.label && <span className="fl-card__label">{card.label}</span>}
        </div>
      ))}

      {/* Speech bubbles */}
      <div className="speech-bubble speech-bubble--left">dARE YOUR FRIEND</div>
      <div className="speech-bubble speech-bubble--right">
        <i className="bx bx-laugh bx-lg" />
      </div>

      {/* Scattered ink text */}
      <p className="scatter-text scatter-text--bl">mAke Him/her Suffer</p>
      <p className="scatter-text scatter-text--tr">or regret it!</p>

      {/* ── Main hero card ── */}
      <div className="landing__main-card" onClick={e => e.stopPropagation()}>
        <h1 className="landing__title">BET YOU<br/>CANt!</h1>
        <p className="landing__subtitle">challenge · dare · win</p>

        <button className="landing__cta" onClick={() => navigate('/home')}>
          <i className="bx bx-play-circle" /> Let's Play
        </button>

        <p className="landing__tap-hint">or tap anywhere to start</p>

        {/* Responsible gaming note */}
        <div className="landing__note">
          <i className="bx bx-heart" />
          <span>Always bet responsibly and have fun doing things you like&nbsp;:&nbsp;)</span>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className="landing__footer">
        <span>
          <i className="bx bx-copyright" style={{verticalAlign:'middle'}} /> 2025 Bet You Can't · Built by&nbsp;
          <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>
            @Tsarles
          </a>
        </span>
        <span className="landing__footer-sep">·</span>
        <a href="#privacy" className="landing__footer-link" onClick={e=>{e.stopPropagation(); e.preventDefault(); document.getElementById('privacy-modal').showModal()}}>
          Privacy &amp; Terms
        </a>
      </div>

      {/* ── Privacy modal ── */}
      <dialog id="privacy-modal" className="privacy-modal" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close()}}>
        <div className="privacy-modal__inner">
          <button className="privacy-modal__close btn btn-ghost" onClick={()=>document.getElementById('privacy-modal').close()}>
            <i className="bx bx-x" /> Close
          </button>

          <h2 className="privacy-modal__title"><i className="bx bx-shield-quarter" /> Privacy &amp; Terms</h2>

          <div className="privacy-modal__body">
            <section>
              <h3>Ownership</h3>
              <p>Bet You Can't is an original project created and owned by <strong>@Tsarles</strong>. All game designs, concepts, and code are the intellectual property of the creator. Unauthorized redistribution or resale is prohibited.</p>
            </section>

            <section>
              <h3>Data &amp; Privacy</h3>
              <p>This app stores game session data <strong>locally in your browser only</strong> (via localStorage). No personal data is transmitted to any server. We do not collect, store, or share your information with third parties.</p>
              <p>Game sessions are temporary and automatically expire. Player names and color choices are stored only for the duration of your session.</p>
            </section>

            <section>
              <h3>Fair Play</h3>
              <p>Bet You Can't is designed for entertainment among friends. Any dares or bets are entirely voluntary and agreed upon by all players. The app takes no responsibility for the outcome of dares or bets made between players.</p>
            </section>

            <section>
              <h3>Responsible Gaming</h3>
              <p>Always bet responsibly. Never bet more than you're comfortable with, and never pressure others into dares or bets they don't want to take. Have fun — that's what it's all about.</p>
            </section>

            <section>
              <h3>Contact</h3>
              <p>Issues or suggestions? Reach out on GitHub: <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">github.com/Tsarles</a></p>
            </section>
          </div>
        </div>
      </dialog>
    </div>
  )
}
