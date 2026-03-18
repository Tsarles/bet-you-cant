import { useState } from 'react'
import './GameCode.css'

export default function GameCode({ code }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try { await navigator.clipboard.writeText(code) }
    catch { const e=document.createElement('textarea'); e.value=code; document.body.appendChild(e); e.select(); document.execCommand('copy'); document.body.removeChild(e) }
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }
  return (
    <div className="game-code">
      <span className="game-code__label"><i className="bx bx-hash" /> Join Code</span>
      <div className="game-code__box">
        <span className="game-code__value">{code}</span>
        <button className={`game-code__copy ${copied?'game-code__copy--done':''}`} onClick={handleCopy}>
          {copied ? <><i className="bx bx-check"/>Copied!</> : <><i className="bx bx-copy"/>Copy</>}
        </button>
      </div>
      <p className="game-code__hint"><i className="bx bx-share-alt" style={{verticalAlign:'middle',marginRight:3}} />Share this with your friend</p>
    </div>
  )
}
