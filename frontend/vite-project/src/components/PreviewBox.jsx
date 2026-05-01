import { useEffect, useRef, useState } from 'react'
import { FileText, Zap } from 'lucide-react'

export default function PreviewBox({ text, currentSign, detecting }) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [prevText, setPrevText] = useState('')
  const [flash, setFlash] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(words.length)
    setCharCount(text.length)
    if (text !== prevText && text.length > prevText.length) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 600)
      return () => clearTimeout(timer)
    }
    setPrevText(text)
  }, [text, prevText])

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FileText size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Live Preview</span>
        </div>
        <span className="badge badge-muted">DOCX Mirror</span>
      </div>

      {detecting && (
        <div style={{ padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', background: 'var(--offset)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Zap size={13} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Detecting</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }} className="gradient-text">
              {currentSign?.letter || '—'}
            </span>
            {currentSign?.confidence > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, marginLeft: 'var(--space-4)', maxWidth: '120px' }}>
                <div className="confidence-bar" style={{ flex: 1 }}>
                  <div className="confidence-fill" style={{ width: `${currentSign.confidence}%` }} />
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', minWidth: '28px' }}>{currentSign.confidence}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5)' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', lineHeight: 1.8,
          color: text ? 'var(--text)' : 'var(--text-faint)',
          background: flash ? 'oklch(from var(--primary) l c h / 0.04)' : 'transparent',
          transition: 'background 0.4s ease', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2)', minHeight: '80px', whiteSpace: 'pre-wrap', wordBreak: 'break-words'
        }}>
          {text
            ? <><span>{text}</span><span className="animate-typing-cursor" /></>
            : <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>Detected text will appear here…</span>
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Words', value: wordCount, gradient: 'linear-gradient(135deg, var(--primary), #18c7f1)' },
          { label: 'Characters', value: charCount, gradient: 'linear-gradient(135deg, var(--accent), #a78bfa)' }
        ].map(({ label, value, gradient }) => (
          <div key={label} style={{
            background: 'var(--offset)', borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3) var(--space-4)', textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
