import './DareBet.css'

const TYPE_LABELS = { dare:'Dare', bet:'Bet', truth:'Truth or Consequences', none:'' }
const TYPE_ICONS  = { dare:'bx-bolt-circle', bet:'bx-coin-stack', truth:'bx-question-mark', none:'bx-target-lock' }

export default function DareBet({ text, type='bet' }) {
  if (!text?.trim()) return null
  const label = TYPE_LABELS[type] || 'The Stakes'
  const icon  = TYPE_ICONS[type]  || 'bx-target-lock'
  return (
    <div className={`dare-bet dare-bet--${type}`}>
      <div className="dare-bet__header">
        <i className={`bx ${icon} dare-bet__icon`} />
        <span className="dare-bet__title">{label}</span>
      </div>
      <blockquote className="dare-bet__text">"{text}"</blockquote>
    </div>
  )
}
