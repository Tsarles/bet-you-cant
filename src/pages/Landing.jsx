// pages/Landing.jsx
// Full card-based layout — no tap-anywhere, proper card grid

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SuggestGame from '../components/SuggestGame'
import { watchLikes, addLike } from '../utils/sessionStore'
import './Landing.css'

// Floating decorative doodle cards (background, non-interactive)
const BG_CARDS = [
  { icon:'bx-grid-alt',                label:'Three Tac Toe',         cls:'fc-1' },
  { icon:'bx-dots-horizontal-rounded', label:'Connect or Sink the 4', cls:'fc-2' },
  { icon:'bx-cycling',                 label:'Ekans',                  cls:'fc-3' },
  { icon:'bx-shuffle',                 label:'Pass the Chaos',         cls:'fc-4' },
  { icon:'bx-trophy',  label:'', cls:'fc-5 fc-small' },
  { icon:'bx-dice-5',  label:'', cls:'fc-6 fc-small' },
  { icon:'bx-joystick',label:'', cls:'fc-7 fc-tiny'  },
]

export default function Landing() {
  const navigate = useNavigate()

  // Like counter
  const [likeCount, setLikeCount]   = useState(0)
  const [liked,     setLiked]       = useState(false)
  const [liking,    setLiking]      = useState(false)
  const [showSuggest, setShowSuggest] = useState(false)
  const [noteLiked,   setNoteLiked]   = useState(false)
  const [noteLikes,   setNoteLikes]   = useState(0)

  // Check if already liked (localStorage — no account needed)
  useEffect(() => {
    setLiked(!!localStorage.getItem('byc_liked'))
    setNoteLiked(!!localStorage.getItem('byc_note_liked'))
    const savedNote = parseInt(localStorage.getItem('byc_note_count') || '0', 10)
    setNoteLikes(savedNote)
  }, [])

  // Real-time like counter from Firebase
  useEffect(() => {
    const unsub = watchLikes(count => setLikeCount(count))
    return () => unsub()
  }, [])

  async function handleLike() {
    if (liked || liking) return
    setLiking(true)
    const ok = await addLike()
    if (ok) {
      localStorage.setItem('byc_liked', '1')
      setLiked(true)
    }
    setLiking(false)
  }

  function handleNoteLike() {
    if (noteLiked) return
    const next = noteLikes + 1
    setNoteLiked(true)
    setNoteLikes(next)
    localStorage.setItem('byc_note_liked', '1')
    localStorage.setItem('byc_note_count', String(next))
  }

  return (
    <div className="landing">

      {/* ── Background floating doodle decorations ── */}
      {BG_CARDS.map((card, i) => (
        <div key={i} className={`fl-card ${card.cls}`} aria-hidden="true">
          <i className={`bx ${card.icon} fl-card__icon`} />
          {card.label && <span className="fl-card__label">{card.label}</span>}
        </div>
      ))}

      {/* Speech bubbles */}
      <div className="speech-bubble speech-bubble--left" aria-hidden>dARE YOUR FRIEND</div>
      <p className="scatter-text scatter-text--bl" aria-hidden>mAke Him/her Suffer</p>
      <p className="scatter-text scatter-text--tr" aria-hidden>or regret it!</p>

      {/* ── Page content ── */}
      <div className="landing__content">

        {/* ── Hero card ── */}
        <div className="landing__hero-card">
          <h1 className="landing__title">BET YOU<br/>CANt!</h1>
          <p className="landing__subtitle">challenge · dare · win</p>
          <button className="landing__cta" onClick={() => navigate('/home')}>
            <i className="bx bx-play-circle" /> Let's Play
          </button>
          <p className="landing__built-by">
            <i className="bx bx-code-alt" style={{verticalAlign:'middle',marginRight:4}} />
            Built by{' '}
            <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">
              @Tsarles
            </a>
            {' '}· © 2026
          </p>
        </div>

        {/* ── Side cards row ── */}
        <div className="landing__side-cards">

          {/* ── Like the page card ── */}
          <div className="landing__side-card landing__like-card">
            <div className="lc-header">
              <div className="lc-icon">
                <i className="bx bx-heart-circle" />
              </div>
              <div>
                <h3 className="lc-title">Love this?</h3>
                <p className="lc-sub">Show some love — no sign-up needed!</p>
              </div>
            </div>

            <div className="lc-count">
              <span className="lc-num">{likeCount.toLocaleString()}</span>
              <span className="lc-label">people liked this</span>
            </div>

            <button
              className={`lc-btn ${liked ? 'lc-btn--liked' : ''}`}
              onClick={handleLike}
              disabled={liked || liking}
            >
              {liking ? (
                <><i className="bx bx-loader-alt bx-spin" /> Sending...</>
              ) : liked ? (
                <><i className="bx bx-heart" /> Liked! Thanks</>
              ) : (
                <><i className="bx bxs-heart" /> Give a Like</>
              )}
            </button>

            {liked && (
              <p className="lc-thanks">
                You're awesome! See you in game :)
              </p>
            )}
          </div>

          {/* ── Suggest a game card ── */}
          <div className="landing__side-card landing__suggest-card">
            <div className="lc-header">
              <div className="lc-icon lc-icon--suggest">
                <i className="bx bx-bulb" />
              </div>
              <div>
                <h3 className="lc-title">Got a game idea?</h3>
                <p className="lc-sub">Help make Bet You Can't even better!</p>
              </div>
            </div>

            <p className="suggest-card-desc">
              Got a wild game concept, a chaos twist, or a dare mechanic in mind?
              Drop your idea and it might become the next game on here!
            </p>

            <button className="lc-btn lc-btn--suggest" onClick={() => setShowSuggest(true)}>
              <i className="bx bx-send" /> Send Your Idea
            </button>
          </div>
        </div>

        {/* ── Responsible gaming note card ── */}
        <div className="landing__note-card">
          <div className="note-card__body">
            <div className="note-card__icon"><i className="bx bx-leaf" /></div>
            <div className="note-card__text">
              <p className="note-card__title">A note from the maker</p>
              <p className="note-card__msg">
                Always bet responsibly and have fun doing things you like :)
                This game was made with love — for friends who want to laugh,
                compete, and make memories. Don't take it too seriously!
              </p>
            </div>
          </div>
          <div className="note-card__footer">
            <button
              className={`note-like-btn ${noteLiked ? 'note-like-btn--liked' : ''}`}
              onClick={handleNoteLike}
              disabled={noteLiked}
              title="Love this note"
            >
              <i className={`bx ${noteLiked ? 'bxs-heart' : 'bx-heart'}`} />
              {noteLiked ? 'Loved it!' : 'Love this'}
            </button>
            {noteLikes > 0 && (
              <span className="note-likes-count">
                {noteLikes} {noteLikes === 1 ? 'person loves' : 'people love'} this note
              </span>
            )}
          </div>
        </div>

        {/* ── Footer links ── */}
        <div className="landing__footer">
          <button
            className="landing__footer-link"
            onClick={() => document.getElementById('privacy-modal').showModal()}
          >
            <i className="bx bx-shield-quarter" /> Privacy &amp; Terms
          </button>
          <span className="landing__footer-sep">·</span>
          <a
            href="https://github.com/Tsarles/bet-you-cant"
            target="_blank" rel="noopener noreferrer"
            className="landing__footer-link"
          >
            <i className="bx bx-code-curly" /> Source Code
          </a>
        </div>
      </div>

      {/* ── Privacy modal ── */}
      <dialog
        id="privacy-modal"
        className="privacy-modal"
        onClick={e => { if(e.target===e.currentTarget) e.currentTarget.close() }}
      >
        <div className="privacy-modal__inner">
          <button
            className="privacy-modal__close btn btn-ghost"
            onClick={() => document.getElementById('privacy-modal').close()}
          >
            <i className="bx bx-x" /> Close
          </button>
          <h2 className="privacy-modal__title">
            <i className="bx bx-shield-quarter" /> Privacy &amp; Terms
          </h2>
          <div className="privacy-modal__body">
            <section>
              <h3>Ownership</h3>
              <p>Bet You Can't is an original project created and owned by <strong>@Tsarles</strong>. All game designs, concepts, and code are the intellectual property of the creator. Unauthorized redistribution or resale is prohibited.</p>
            </section>
            <section>
              <h3>Data &amp; Privacy</h3>
              <p>Game sessions are stored in <strong>Firebase Firestore</strong> temporarily for real-time multiplayer. The like counter stores only a number — no names, emails, or accounts. No personal data is collected, sold, or shared.</p>
            </section>
            <section>
              <h3>Fair Play</h3>
              <p>Dares and bets are entirely voluntary and agreed upon by all players. The app takes no responsibility for the outcome of dares or bets made between players.</p>
            </section>
            <section>
              <h3>Responsible Gaming</h3>
              <p>Always bet responsibly. Never bet more than you're comfortable with. Have fun — that's what it's all about.</p>
            </section>
            <section>
              <h3>Contact</h3>
              <p>Issues or suggestions? Reach out on GitHub: <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">github.com/Tsarles</a></p>
            </section>
          </div>
        </div>
      </dialog>

      {/* ── Suggest modal ── */}
      {showSuggest && <SuggestGame onClose={() => setShowSuggest(false)} />}
    </div>
  )
}
