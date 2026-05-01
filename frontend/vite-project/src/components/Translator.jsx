import { useState, useEffect } from 'react'
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export default function Translator({ text, selectedLanguage }) {
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!text || !selectedLanguage) {
      setTranslated('')
      return
    }

    const translateText = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await axios.get(`${BASE_URL}/translate`, {
          params: { lang: selectedLanguage, text }
        })
        setTranslated(response.data.translated)
      } catch (e) {
        setError('Translation failed')
        console.error('Translation error:', e)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(translateText, 500)
    return () => clearTimeout(timer)
  }, [text, selectedLanguage])

  const languageName = { hi: 'Hindi', ta: 'Tamil', ml: 'Malayalam' }[selectedLanguage] || selectedLanguage

  return (
    <div className="card" style={{ padding: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }} className="gradient-text">
          Translation → {languageName}
        </span>
        {loading && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>Translating...</span>}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-base)',
        lineHeight: 1.7,
        color: translated ? 'var(--text)' : 'var(--text-faint)',
        background: 'var(--offset)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        minHeight: '60px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-words'
      }}>
        {error ? <span style={{ color: 'var(--warning)' }}>{error}</span> : (translated || 'Translation will appear here…')}
      </div>
    </div>
  )
}
