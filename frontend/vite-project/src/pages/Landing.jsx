import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const features = [
  { icon: '🤟', title: 'ASL Detection', desc: 'Real-time American Sign Language alphabet recognition via MediaPipe hand tracking at 30 FPS.' },
  { icon: '⏱️', title: '2-Second Confirm', desc: 'Hold a sign for 2 seconds to confirm — preventing accidental typing with smart debouncing.' },
  { icon: '📝', title: 'Auto Type to DOCX', desc: 'Every confirmed letter or word is instantly typed into a live Word document preview.' },
  { icon: '🌐', title: 'Live Translation', desc: 'Translate detected English text to Hindi, Tamil, and Malayalam in real-time.' },
  { icon: '⌫', title: 'Smart Editing', desc: 'Backspace to delete the last word, Clear to wipe all text, Restart to begin fresh detection.' },
  { icon: '📥', title: 'Export DOCX', desc: 'Download your full session as a professionally formatted Word document with one click.' },
]

const modes = [
  { id: 'asl', label: 'ASL', icon: '🔤', desc: 'Alphabet signs' },
  { id: 'words', label: 'Words', icon: '💬', desc: 'Gesture vocabulary' },
  { id: 'hindi', label: 'Hindi', icon: '🇮🇳', desc: 'Hindi script output' },
  { id: 'eng-hi', label: 'EN→HI', icon: '🔄', desc: 'Translate to Hindi' },
  { id: 'eng-ta', label: 'EN→TA', icon: '🔄', desc: 'Translate to Tamil' },
  { id: 'eng-ml', label: 'EN→ML', icon: '🔄', desc: 'Translate to Malayalam' },
]

export default function Landing() {
  const navigate = useNavigate()
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('animate-fade-in')
        }),
      { threshold: 0.1 }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100dvh' }}>
      
      {/* NAV */}
      <nav className="glass" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 var(--space-8)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <LogoSVG size={32} />
            <span className="gradient-text" style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
              SignLang AI
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span className="badge badge-success">● Live</span>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}
            >
              Docs
            </a>

            <button className="btn-primary" onClick={() => navigate('/detect')}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{
        paddingTop: '140px',
        paddingBottom: '100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 var(--space-8)' }}>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900,
            marginBottom: 'var(--space-6)'
          }}>
            Translate Sign Language
            <br />
            <span className="gradient-text">into Words, Instantly</span>
          </h1>

          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-10)'
          }}>
            Point your camera, make a sign — watch it type itself into a Word document.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate('/detect')}
          >
            🚀 Start Detecting
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* ✅ FIXED HERE */}
          <div
            className="reveal"
            style={{
              textAlign: 'center',
              marginBottom: 'var(--space-12',
              opacity: 0
            }}
          >
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
              Everything you need
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              A complete sign language detection workflow in one app.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="card reveal"
                style={{ padding: 'var(--space-6)', opacity: 0 }}
              >
                <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: 'var(--space-8)',
        textAlign: 'center'
      }}>
        <p>SignLang AI · Built with FastAPI + React + MediaPipe</p>
      </footer>
    </div>
  )
}

function LogoSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#06aad8" />
      <text x="16" y="22" textAnchor="middle" fontSize="16" fill="white">🤟</text>
    </svg>
  )
}