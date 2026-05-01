import { Delete, Download, RotateCcw, Trash2 } from 'lucide-react'

export default function ControlPanel({ onBackspace, onClear, onRestart, onDownload, hasText, detecting, cameraOn }) {
  const controls = [
    { label: 'Backspace', icon: <Delete size={16} />, onClick: onBackspace, disabled: !hasText, className: 'btn-secondary', title: 'Delete last word' },
    { label: 'Clear All', icon: <Trash2 size={16} />, onClick: onClear, disabled: !hasText && !detecting, className: 'btn-danger', title: 'Wipe all text' },
    { label: 'Restart', icon: <RotateCcw size={16} />, onClick: onRestart, disabled: !cameraOn, className: 'btn-secondary', title: 'Reset & restart camera' },
    { label: 'Download DOCX', icon: <Download size={16} />, onClick: onDownload, disabled: !hasText, className: 'btn-primary', title: 'Export Word document' },
  ]

  return (
    <div className="card" style={{ padding: 'var(--space-4) var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Controls
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {controls.map(ctrl => (
          <button key={ctrl.label} className={ctrl.className} onClick={ctrl.onClick} disabled={ctrl.disabled} title={ctrl.title}
            style={{ opacity: ctrl.disabled ? 0.4 : 1, cursor: ctrl.disabled ? 'not-allowed' : 'pointer' }}>
            {ctrl.icon}
            {ctrl.label}
          </button>
        ))}
      </div>
    </div>
  )
}
