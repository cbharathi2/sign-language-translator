import { ArrowLeft } from 'lucide-react'

const MODES = [
  { id: 'asl',    icon: '🔤', label: 'ASL',       sub: 'Alphabet Signs',     group: 'Detection' },
  { id: 'words',  icon: '💬', label: 'Words',     sub: 'Gesture Vocabulary', group: 'Detection' },
  { id: 'hindi',  icon: '🇮🇳', label: 'Hindi',     sub: 'Hindi Script',       group: 'Detection' },
  { id: 'eng-hi', icon: '🔄', label: 'EN → Hindi',sub: 'Translate',          group: 'Translation' },
  { id: 'eng-ta', icon: '🔄', label: 'EN → Tamil',sub: 'Translate',          group: 'Translation' },
  { id: 'eng-ml', icon: '🔄', label: 'EN → Malay',sub: 'Translate',          group: 'Translation' },
]

export default function Sidebar({ mode, setMode, onBack, backendStatus }) {
  const groups = [...new Set(MODES.map(m => m.group))]

  return (
    <aside style={{
      width: '220px', flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden'
    }}>
      <div style={{ padding: 'var(--space-5) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          color: 'var(--text-muted)', fontSize: 'var(--text-xs)',
          marginBottom: 'var(--space-4)', transition: 'color 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={14} /> Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.4rem' }}>🤟</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }} className="gradient-text">SignLang AI</span>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-3)' }}>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{
              fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-faint)',
              padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-1)'
            }}>
              {group}
            </div>
            {MODES.filter(m => m.group === group).map(m => {
              const active = mode === m.id
              return (
                <button key={m.id} onClick={() => setMode(m.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-3)', borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-1)',
                  background: active ? 'var(--primary-hl)' : 'transparent',
                  border: active ? '1px solid oklch(from var(--primary) l c h / 0.3)' : '1px solid transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  textAlign: 'left', transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--offset)'; e.currentTarget.style.color = 'var(--text)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{m.label}</div>
                    <div style={{ fontSize: '0.68rem', color: active ? 'var(--primary)' : 'var(--text-faint)', opacity: 0.8 }}>{m.sub}</div>
                  </div>
                  {active && (
                    <div style={{
                      marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--primary)', flexShrink: 0
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
          background: backendStatus === 'online' ? 'oklch(from #22c55e l c h / 0.08)' : 'var(--offset)',
          border: backendStatus === 'online' ? '1px solid oklch(from #22c55e l c h / 0.25)' : '1px solid var(--border)'
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: backendStatus === 'online' ? 'var(--success)' : 'var(--text-faint)'
          }} />
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: backendStatus === 'online' ? 'var(--success)' : 'var(--text-faint)' }}>
              Backend {backendStatus === 'online' ? 'Online' : 'Offline'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>localhost:8000</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
