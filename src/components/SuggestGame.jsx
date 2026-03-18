// components/SuggestGame.jsx — centered modal using modal-backdrop

import { useState } from 'react'
import './SuggestGame.css'

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || 'YOUR_FORM_ID'

export default function SuggestGame({ onClose }) {
  const [form,   setForm]   = useState({ name:'', idea:'', contact:'' })
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.idea.trim()) return
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify({
          name:     form.name    || 'Anonymous',
          idea:     form.idea,
          contact:  form.contact || 'none',
          _subject: `[Bet You Can't] New Game Suggestion`,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-box suggest-box animate-fade">

        <div className="modal-box__header">
          <h2 className="modal-box__title">
            <i className="bx bx-bulb" /> Suggest a Game
          </h2>
          <button className="modal-box__close btn btn-ghost" onClick={onClose}>
            <i className="bx bx-x" />
          </button>
        </div>

        <div className="modal-box__body">
          {status === 'sent' ? (
            <div className="suggest-success">
              <i className="bx bx-check-circle suggest-success-icon" />
              <h3>Suggestion sent!</h3>
              <p>Thanks for the idea — we'll look into it!</p>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          ) : (
            <form className="suggest-form" onSubmit={handleSubmit}>
              <p className="suggest-intro">
                Got a wild game concept, chaos twist, or dare mechanic in mind?
                Drop it here — it might become the next game on Bet You Can't!
              </p>

              <div className="suggest-field">
                <label className="suggest-label">
                  <i className="bx bx-user" /> Your name <span>(optional)</span>
                </label>
                <input
                  className="input"
                  placeholder="e.g. Tsarles"
                  value={form.name}
                  onChange={e => setForm(f=>({...f,name:e.target.value}))}
                  maxLength={40}
                />
              </div>

              <div className="suggest-field">
                <label className="suggest-label">
                  <i className="bx bx-game" /> Your game idea <span className="suggest-required">*</span>
                </label>
                <textarea
                  className="input"
                  placeholder="Describe your game — rules, the twist, what makes it fun..."
                  value={form.idea}
                  onChange={e => setForm(f=>({...f,idea:e.target.value}))}
                  rows={5}
                  required
                />
              </div>

              <div className="suggest-field">
                <label className="suggest-label">
                  <i className="bx bx-envelope" /> Contact <span>(optional)</span>
                </label>
                <input
                  className="input"
                  placeholder="Email or socials so we can credit you"
                  value={form.contact}
                  onChange={e => setForm(f=>({...f,contact:e.target.value}))}
                  maxLength={80}
                />
              </div>

              {status === 'error' && (
                <p className="suggest-error">
                  <i className="bx bx-error-circle" /> Something went wrong. Try again!
                </p>
              )}

              <button
                className="btn btn-primary suggest-submit"
                type="submit"
                disabled={status==='sending' || !form.idea.trim()}
              >
                {status==='sending'
                  ? <><i className="bx bx-loader-alt bx-spin" /> Sending...</>
                  : <><i className="bx bx-send" /> Send Suggestion</>
                }
              </button>

              <p className="suggest-note">
                Built by{' '}
                <a href="https://github.com/Tsarles" target="_blank" rel="noopener noreferrer">@Tsarles</a>
                {' '}— your idea could be the next game!
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
