import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { QRCodeErrorBoundary } from '@/components/QRCodeErrorBoundary.jsx'
import { useQrContent } from '@/hooks/useQrContent.js'

const QR_KINDS = ['resume', 'linkedin', 'github', 'portfolio']

function QrBlock({ value, size, theme, level = 'M' }) {
  return (
    <QRCodeErrorBoundary>
      <QRCodeSVG
        value={value || ' '}
        size={size}
        level={level}
        marginSize={3}
        title=""
        bgColor={theme === 'dark' ? '#0d1830' : '#ffffff'}
        fgColor={theme === 'dark' ? '#f8fbff' : '#2e1065'}
      />
    </QRCodeErrorBoundary>
  )
}

function useLargeQrSize(isOpen) {
  const [size, setSize] = useState(380)

  useEffect(() => {
    if (!isOpen) return undefined

    const compute = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxByWidth = vw - 56
      const maxByHeight = Math.floor(vh * 0.52)
      const cap = Math.min(480, maxByWidth, maxByHeight)
      setSize(Math.max(280, Math.floor(cap)))
    }

    compute()
    window.addEventListener('resize', compute, { passive: true })
    return () => window.removeEventListener('resize', compute)
  }, [isOpen])

  return size
}

function truncateUrl(value, max = 52) {
  if (!value || value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

export function HeroQrCard({ theme }) {
  const { activeQr, setActiveQr, currentQr, qrByKind } = useQrContent()
  const [open, setOpen] = useState(false)
  const largeSize = useLargeQrSize(open)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const modal =
    open &&
    createPortal(
      <div className="qr-lightbox-backdrop" role="presentation" onClick={() => setOpen(false)}>
        <div
          className="qr-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={currentQr.heading}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="qr-lightbox-close" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
          <p className="qr-lightbox-eyebrow">{currentQr.eyebrow}</p>
          <h2 className="qr-lightbox-title">{currentQr.heading}</h2>
          <p className="qr-lightbox-instructions">{currentQr.description}</p>
          <div className="qr-lightbox-frame">
            <QrBlock value={currentQr.value} size={largeSize} theme={theme} level="H" />
          </div>
          <div className="qr-lightbox-meta">
            <span className="qr-lightbox-meta-label">Encoded link</span>
            <p className="qr-scan-hint qr-scan-hint--modal">{currentQr.hint}</p>
            <p className="qr-encode-url qr-encode-url--modal">{currentQr.value}</p>
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      <div className="resume-qr-card resume-qr-card--full">
        <div className="resume-qr-meta">
          <p className="eyebrow">{currentQr.eyebrow}</p>
          <h3>{currentQr.heading}</h3>
          <p className="resume-qr-blurb">{currentQr.description}</p>
          <div className="qr-trigger-row" role="tablist" aria-label="Choose QR code type">
            {QR_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                role="tab"
                aria-selected={activeQr === kind}
                className={`qr-trigger-btn${activeQr === kind ? ' is-active' : ''}`}
                onClick={() => setActiveQr(kind)}
              >
                {qrByKind[kind].eyebrow}
              </button>
            ))}
          </div>
        </div>
        <div
          className="resume-qr-code resume-qr-panel qr-panel-enlarge"
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Enlarge QR code"
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        >
          <div className="resume-qr-frame" key={activeQr}>
            <QrBlock value={currentQr.value} size={124} theme={theme} level="M" />
          </div>
          <p className="qr-scan-hint">Tap or click to enlarge · easier to scan</p>
          <p className="qr-encode-url">{truncateUrl(currentQr.value)}</p>
        </div>
      </div>
      {modal}
    </>
  )
}
