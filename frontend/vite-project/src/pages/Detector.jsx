import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import WebcamFeed from '../components/WebcamFeed.jsx'
import PreviewBox from '../components/PreviewBox.jsx'
import ControlPanel from '../components/ControlPanel.jsx'
import Translator from '../components/Translator.jsx'
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export default function Detector() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('asl')
  const [cameraOn, setCameraOn] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectedText, setDetectedText] = useState('')
  const [currentSign, setCurrentSign] = useState({ letter: '', confidence: 0 })
  const [backendStatus, setBackendStatus] = useState('checking')

  // Check backend health
  useEffect(() => {
    axios.get(`${BASE_URL}/health`, { timeout: 3000 })
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const handleSignDetected = useCallback((sign) => {
    setCurrentSign(sign)
  }, [])

  const handleWordConfirmed = useCallback((word) => {
    if (!word) return
    setDetectedText((prevText) => {
      const nextText = prevText ? `${prevText} ${word}` : word
      axios.post(`${BASE_URL}/docx/set`, { text: nextText }).catch((e) => {
        console.warn('DOCX sync failed:', e)
      })
      return nextText
    })
  }, [])

  const handleBackspace = useCallback(async () => {
    const words = detectedText.trim().split(' ')
    words.pop()
    const newText = words.join(' ')
    setDetectedText(newText)
    try { await axios.post(`${BASE_URL}/docx/set`, { text: newText }) } catch {}
  }, [detectedText])

  const handleClear = useCallback(async () => {
    setDetectedText('')
    setCurrentSign({ letter: '', confidence: 0 })
    try { await axios.post(`${BASE_URL}/docx/reset`) } catch {}
  }, [])

  const handleRestart = useCallback(() => {
    handleClear()
    setCameraOn(false)
    setTimeout(() => setCameraOn(true), 300)
  }, [handleClear])

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/docx/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `signlang_${Date.now()}.docx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) { alert('Download failed. Is the backend running?') }
  }

  const translationMode = ['eng-hi', 'eng-ta', 'eng-ml'].includes(mode) ? mode : null
  const detectMode = ['asl', 'words', 'hindi'].includes(mode) ? mode : 'asl'
  const langMap = { 'eng-hi': 'hi', 'eng-ta': 'ta', 'eng-ml': 'ml' }

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <Sidebar mode={mode} setMode={setMode} onBack={() => navigate('/')} backendStatus={backendStatus} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header className="glass" style={{
          height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 var(--space-6)', borderBottom: '1px solid var(--border)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }} className="gradient-text">SignLang AI</span>
            <span className="badge badge-muted">{modeLabel(mode)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className={`badge ${backendStatus === 'online' ? 'badge-success' : 'badge-muted'}`}>
              {backendStatus === 'online' ? '● Backend Online' : '○ Backend Offline'}
            </span>
            {detecting && <span className="badge badge-primary">⚡ Detecting</span>}
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Top row: Camera + Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', minHeight: '360px' }}>
            <WebcamFeed
              cameraOn={cameraOn}
              setCameraOn={setCameraOn}
              detecting={detecting}
              setDetecting={setDetecting}
              mode={detectMode}
              onSignDetected={handleSignDetected}
              onWordConfirmed={handleWordConfirmed}
              backendStatus={backendStatus}
            />
            <PreviewBox
              text={detectedText}
              currentSign={currentSign}
              detecting={detecting}
            />
          </div>

          {/* Control Panel */}
          <ControlPanel
            onBackspace={handleBackspace}
            onClear={handleClear}
            onRestart={handleRestart}
            onDownload={handleDownload}
            hasText={!!detectedText}
            detecting={detecting}
            cameraOn={cameraOn}
          />

          {/* Translator (conditional) */}
          {translationMode && (
            <Translator text={detectedText} selectedLanguage={langMap[translationMode]} />
          )}
        </div>
      </div>
    </div>
  )
}

function modeLabel(mode) {
  const map = { asl: '🔤 ASL', words: '💬 Words', hindi: '🇮🇳 Hindi', 'eng-hi': '🔄 EN→HI', 'eng-ta': '🔄 EN→TA', 'eng-ml': '🔄 EN→ML' }
  return map[mode] || mode
}