import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'

function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing AI Engine...')

  useEffect(() => {
    const statuses = [
      'Initializing AI Engine...',
      'Loading MediaPipe Models...',
      'Calibrating Hand Detection...',
      'Preparing Sign Database...',
      'Almost Ready...',
    ]
    let step = 0
    const interval = setInterval(() => {
      step++
      setProgress(Math.min(step * 22, 100))
      if (step < statuses.length) setStatus(statuses[step])
      if (step >= 5) clearInterval(interval)
    }, 480)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)'
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '25%', left: '25%',
          width: '500px', height: '500px', borderRadius: '50%',
          opacity: 0.08, filter: 'blur(80px)',
          background: 'radial-gradient(circle, var(--primary), transparent)'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '20%',
          width: '400px', height: '400px', borderRadius: '50%',
          opacity: 0.06, filter: 'blur(80px)',
          background: 'radial-gradient(circle, var(--accent), transparent)'
        }} />
      </div>

      <div className="animate-float" style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <div className="animate-detecting" style={{
          width: '96px', height: '96px', borderRadius: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem',
          background: 'linear-gradient(135deg, var(--primary-hl), var(--accent-hl))',
          border: '1px solid var(--border)'
        }}>🤟</div>
      </div>

      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }} className="gradient-text">
        SignLang AI
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '3rem' }}>
        Real-time Sign Language Detection Platform
      </p>

      <div style={{ width: '240px', marginBottom: '1rem' }}>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-xs)' }}>{status}</p>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <LoadingScreen />

  return <Outlet />
}