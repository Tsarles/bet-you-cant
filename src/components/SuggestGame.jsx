// components/SuggestGame.jsx
// Suggestion form — sends via mailto to the owner's email

import { useState } from 'react'
import './SuggestGame.css'

const OWNER_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'your-email@gmail.com'

const CATEGORIES = [
  'New Game Idea',
  'Bug Report',
  'Design Improvement',
  'Feature Request',
  'Other',
]

export default function SuggestGame({ onClose }) {
  const [name,     setName]     = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [message,  setMessage]  = useState('')
  const [sent,     setSent]     = useState(false)

  function handleSend() {
    if (!message.trim()) return

    const subject = encodeURIComponent(`[Bet You Can't] ${category} — from ${name || 'Anonymous'}`)
    const body    = encodeURIComponent(
      `Name: ${name || 'Anonymous'}\nCategory: ${category}\n\n${message}\n\n---\nSent from Bet You Can't`
    )
    window.open(`mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`, '_blank')
    setSent(true)
  }

  return (
    <div className="suggest-modal">
      <div className="suggest-modal__header">
        <div className="suggest-modal__title-row">
          <i className="bx bx-bulb suggest-modal__icon" />
          <h2 className="suggest-modal__title">Suggest a Game or Idea</h2>
        </div>
        <button className="btn btn-ghost suggest-modal__close" onClick={onClose}>
          <i className="bx bx-x" />
        </button>
      </div>

      {!sent ? (
        <>
          <p className="suggest-modal__subtitle">
            Got a game idea or feedback? Send it directly — it might end up in the next update!
          </p>

          <div className="suggest-form">
            <div className="suggest-field">
              <label className="suggest-label">
                <i className="bx bx-user" /> Your Name <span className="suggest-opt">(optional)</span>
              </label>
              <input
                className="input"
                placeholder="e.g. Tsarles"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="suggest-field">
              <label className="suggest-label">
                <i className="bx bx-category" /> Category
              </label>
              <div className="suggest-cats">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`suggest-cat-btn ${category === cat ? 'suggest-cat-btn--active' : ''}`}
                    onClick={() => setCategory(cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="suggest-field">
              <label className="suggest-label">
                <i className="bx bx-message-rounded-edit" /> Your Idea / Message
              </label>
              <textarea
                className="input"
                placeholder={
                  category === 'New Game Idea'
                    ? 'Describe the game concept, rules, and any fun twists...'
                    : category === 'Bug Report'
                    ? 'What happened? What were you doing when it broke?'
                    : 'Tell us what you think...'
                }
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
              />
            </div>

            <div className="suggest-footer">
              <p className="suggest-note">
                <i className="bx bx-info-circle" />
                This opens your mail app with everything pre-filled.
              </p>
              <button
                className="btn btn-primary suggest-send-btn"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <i className="bx bx-send" /> Send Suggestion
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="suggest-success">
          <i className="bx bx-check-circle suggest-success__icon" />
          <h3 className="suggest-success__title">Thanks for the suggestion!</h3>
          <p className="suggest-success__text">
            Your mail app should have opened with the message ready to send.
            If not, check your popup blocker or email directly at{' '}
            <strong>{OWNER_EMAIL}</strong>.
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            <i className="bx bx-arrow-back" /> Close
          </button>
        </div>
      )}
    </div>
  )
}
