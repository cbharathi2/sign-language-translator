import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, CameraOff, Play, StopCircle } from 'lucide-react'

// MediaPipe hand connection indices
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],           // Index
  [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
  [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
  [5, 9], [9, 13], [13, 17]                 // Palm connections
]

const HAND_POINT_COUNT = 21

export default function WebcamFeed({
  cameraOn, setCameraOn, detecting, setDetecting,
  mode, onSignDetected, onWordConfirmed, backendStatus
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const loopRef = useRef(null)
  const waitingRef = useRef(false)
  const modeRef = useRef(mode)
  const holdRef = useRef({ letter: '', start: 0, confirmed: false })
  const [holdProgress, setHoldProgress] = useState(0)
  const [pendingSign, setPendingSign] = useState('')
  const [camError, setCamError] = useState('')

  const HOLD_DURATION = 2000
  const WS_URL = 'ws://localhost:8000/ws/detect'

  const drawLandmarks = useCallback((landmarks) => {
    const overlayCanvas = overlayCanvasRef.current
    const video = videoRef.current
    if (!overlayCanvas || !video || landmarks.length === 0) return

    const ctx = overlayCanvas.getContext('2d')
    const width = video.clientWidth
    const height = video.clientHeight

    if (overlayCanvas.width !== width || overlayCanvas.height !== height) {
      overlayCanvas.width = width
      overlayCanvas.height = height
    }

    ctx.clearRect(0, 0, width, height)

    const handCount = Math.ceil(landmarks.length / HAND_POINT_COUNT)
    for (let handIndex = 0; handIndex < handCount; handIndex += 1) {
      const offset = handIndex * HAND_POINT_COUNT
      const isFirstHand = handIndex === 0

      ctx.strokeStyle = isFirstHand ? 'rgba(0, 200, 255, 0.6)' : 'rgba(255, 165, 0, 0.75)'
      ctx.lineWidth = 2
      HAND_CONNECTIONS.forEach(([start, end]) => {
        const i1 = offset + start
        const i2 = offset + end
        if (i1 < landmarks.length && i2 < landmarks.length) {
          const p1 = landmarks[i1]
          const p2 = landmarks[i2]
          ctx.beginPath()
          ctx.moveTo(p1.x * width, p1.y * height)
          ctx.lineTo(p2.x * width, p2.y * height)
          ctx.stroke()
        }
      })
    }

    landmarks.forEach((lm, i) => {
      const handIndex = Math.floor(i / HAND_POINT_COUNT)
      const x = lm.x * width
      const y = lm.y * height
      ctx.fillStyle = handIndex === 0 ? 'rgba(0, 200, 255, 0.9)' : 'rgba(255, 165, 0, 0.9)'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [])

  const startCamera = useCallback(async () => {
    setCamError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = videoRef.current.videoWidth
          overlayCanvasRef.current.height = videoRef.current.videoHeight
        }
      }
      setCameraOn(true)
    } catch (err) {
      setCamError('Camera access denied. Please allow camera permissions.')
      console.error(err)
    }
  }, [setCameraOn])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    stopDetection()
  }, [setCameraOn])

  const clearOverlay = useCallback(() => {
    if (!overlayCanvasRef.current) return
    const ctx = overlayCanvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)
  }, [])

  const startLoop = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const ctx = canvas.getContext('2d')
    const sendFrame = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || waitingRef.current) return
      if (!video || video.readyState < 2) {
        requestAnimationFrame(sendFrame)
        return
      }

      waitingRef.current = true
      canvas.width = 320
      canvas.height = 240
      ctx.drawImage(video, 0, 0, 320, 240)
      const dataURL = canvas.toDataURL('image/jpeg', 0.6)
      console.log('Sending frame, mode:', modeRef.current)
      wsRef.current.send(JSON.stringify({ image: dataURL, mode: modeRef.current }))
    }

    sendFrame()
  }, [])

  const startDetection = useCallback(() => {
    if (!cameraOn) return
    console.log('Starting detection')
    wsRef.current = new WebSocket(WS_URL)
    wsRef.current.onopen = () => {
      console.log('WebSocket opened')
      setDetecting(true)
      startLoop()
    }
    wsRef.current.onmessage = (e) => {
      waitingRef.current = false
      const data = JSON.parse(e.data)
      console.log('Message received:', data)
      if (data.landmarks && data.landmarks.length > 0) {
        drawLandmarks(data.landmarks)
      } else {
        clearOverlay()
      }
      onSignDetected(data)

      const letter = data.letter
      if (!letter) {
        holdRef.current = { letter: '', start: 0, confirmed: false }
        setPendingSign('')
        setHoldProgress(0)
      } else {
        const now = Date.now()
        if (holdRef.current.letter !== letter) {
          holdRef.current = { letter, start: now, confirmed: false }
          setPendingSign(letter)
          setHoldProgress(0)
        } else {
          const elapsed = now - holdRef.current.start
          const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
          setHoldProgress(progress)
          if (elapsed >= HOLD_DURATION && !holdRef.current.confirmed) {
            holdRef.current.confirmed = true
            onWordConfirmed(letter)
            holdRef.current = { letter: '', start: 0, confirmed: false }
            setPendingSign('')
            setHoldProgress(0)
          }
        }
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        startLoop()
      }
    }
    wsRef.current.onerror = () => console.error('WS error')
    wsRef.current.onclose = () => setDetecting(false)
  }, [cameraOn, onSignDetected, onWordConfirmed, setDetecting, drawLandmarks, clearOverlay, startLoop])

  const stopDetection = useCallback(() => {
    waitingRef.current = false
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    setDetecting(false)
    setPendingSign('')
    setHoldProgress(0)
    clearOverlay()
  }, [setDetecting, clearOverlay])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (cameraOn && backendStatus === 'online' && !detecting) {
      startDetection()
    }
  }, [cameraOn, backendStatus, detecting, startDetection])

  useEffect(() => () => { stopCamera(); stopDetection() }, [])

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Camera size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Camera Feed</span>
        </div>
        {detecting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} className="animate-detecting" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600 }}>DETECTING</span>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', flex: 1, background: 'var(--offset)', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraOn ? 'block' : 'none',
            transform: 'scaleX(-1)',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />

        <canvas
          ref={overlayCanvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: cameraOn && detecting ? 'block' : 'none',
            transform: 'scaleX(-1)',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!cameraOn && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            color: 'var(--text-faint)'
          }}>
            <CameraOff size={48} />
            <p style={{ fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: '200px' }}>
              {camError || 'Click "Start Camera" to begin detection'}
            </p>
          </div>
        )}

        {detecting && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[['0', '0', 'top', 'left'], ['0', 'auto', 'top', 'right'], ['auto', '0', 'bottom', 'left'], ['auto', 'auto', 'bottom', 'right']].map(([t, r, tc, lc], i) => (
              <div key={i} style={{
                position: 'absolute',
                top: tc === 'top' ? '12px' : 'auto',
                right: lc === 'right' ? '12px' : 'auto',
                bottom: tc === 'bottom' ? '12px' : 'auto',
                left: lc === 'left' ? '12px' : 'auto',
                width: '24px',
                height: '24px',
                borderTop: tc === 'top' ? '2px solid var(--primary)' : 'none',
                borderBottom: tc === 'bottom' ? '2px solid var(--primary)' : 'none',
                borderLeft: lc === 'left' ? '2px solid var(--primary)' : 'none',
                borderRight: lc === 'right' ? '2px solid var(--primary)' : 'none'
              }} />
            ))}
          </div>
        )}

        {pendingSign && (
          <div style={{
            position: 'absolute',
            bottom: 'var(--space-4)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'oklch(from var(--bg) l c h / 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3) var(--space-5)',
            textAlign: 'center',
            minWidth: '140px',
            zIndex: 10
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }} className="gradient-text">
              {pendingSign}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '6px 0 4px' }}>
              Hold to confirm...
            </div>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: `${holdProgress}%`, transition: 'width 0.1s linear' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        {!cameraOn ? (
          <button className="btn-primary" onClick={startCamera} style={{ flex: 1 }}>
            <Camera size={15} /> Start Camera
          </button>
        ) : (
          <>
            {!detecting ? (
              <button
                className="btn-primary"
                onClick={startDetection}
                disabled={backendStatus !== 'online'}
                style={{ flex: 1, opacity: backendStatus !== 'online' ? 0.5 : 1 }}
              >
                <Play size={15} /> Start Detecting
              </button>
            ) : (
              <button className="btn-secondary" onClick={stopDetection} style={{ flex: 1 }}>
                <StopCircle size={15} /> Stop Detecting
              </button>
            )}
            <button className="btn-danger" onClick={stopCamera}>
              <CameraOff size={15} /> Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  )
}