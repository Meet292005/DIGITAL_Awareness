import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Cpu, Activity, Lock, RefreshCw, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const DEFENSE_PILLARS = [
  {
    id: 'phishing',
    name: 'Phishing Intercept',
    status: 'OPTIMAL',
    score: 98,
    metric: '0.04s detection latency',
    color: '#10B981',
    description: 'Autonomous heuristic inspection of inbound links, homoglyph domains, and forged headers.',
  },
  {
    id: 'identity',
    name: 'Identity & MFA Shield',
    status: 'ACTIVE',
    score: 95,
    metric: 'Hardware FIDO2 enforced',
    color: '#6366F1',
    description: 'Cryptographic passkey authentication protecting against SIM-swap and session hijacking.',
  },
  {
    id: 'payment',
    name: 'Payment & UPI Guard',
    status: 'FORTIFIED',
    score: 99,
    metric: 'Zero reverse-collect risk',
    color: '#06B6D4',
    description: 'Enforces the golden transaction protocol: incoming funds never require PIN entry.',
  },
]

export default function RealisticSecurityCockpit() {
  const [activePillar, setActivePillar] = useState(DEFENSE_PILLARS[0])
  const [isAuditing, setIsAuditing] = useState(false)
  const [overallScore, setOverallScore] = useState(97)
  const [lastAuditTime, setLastAuditTime] = useState('Just now')

  const handleRunAudit = () => {
    cyberSound.playScan()
    setIsAuditing(true)
    setTimeout(() => {
      setIsAuditing(false)
      setOverallScore(99)
      setLastAuditTime('Updated just now')
      cyberSound.playSuccess()
    }, 600)
  }

  const handleSelectPillar = (pillar) => {
    cyberSound.playClick()
    setActivePillar(pillar)
  }

  return (
    <div className="realistic-cockpit-card">
      {/* COCKPIT TOPBAR */}
      <div className="cockpit-topbar">
        <div className="cockpit-status-tag">
          <span className="cockpit-live-pulse" />
          <span>SECURITY OPERATING POSTURE · REAL-TIME</span>
        </div>
        <span className="cockpit-audit-timestamp">Telemetry: {lastAuditTime}</span>
      </div>

      {/* METRIC HERO SECTION */}
      <div className="cockpit-metric-row">
        <div className="score-block">
          <div className="score-number-wrap">
            <span className="score-number">{overallScore}</span>
            <span className="score-total">/100</span>
          </div>
          <span className="score-label">DEFENSE READINESS INDEX</span>
        </div>

        <div className="status-summary-block">
          <div className="summary-badge">
            <ShieldCheck size={16} />
            <span>ALL SYSTEMS PROTECTED</span>
          </div>
          <p className="summary-text">
            Autonomous threat interception active across email, messaging, payments, and browser sessions.
          </p>
        </div>
      </div>

      {/* THREE INTERACTIVE DEFENSE VECTORS */}
      <div className="cockpit-pillars-grid">
        {DEFENSE_PILLARS.map((p) => {
          const isSelected = p.id === activePillar.id
          return (
            <button
              key={p.id}
              type="button"
              className={`pillar-card ${isSelected ? 'pillar-active' : ''}`}
              onClick={() => handleSelectPillar(p)}
              style={{
                borderColor: isSelected ? p.color : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="pillar-card-top">
                <span className="pillar-title">{p.name}</span>
                <span className="pillar-score" style={{ color: p.color }}>{p.score}%</span>
              </div>
              <span className="pillar-metric">{p.metric}</span>
              <span className="pillar-status" style={{ color: p.color }}>● {p.status}</span>
            </button>
          )
        })}
      </div>

      {/* DETAIL DEEP-DIVE STRIP */}
      <div className="cockpit-detail-strip">
        <div className="detail-info">
          <strong>{activePillar.name} Protocol:</strong>
          <span>{activePillar.description}</span>
        </div>
        <button
          type="button"
          className="cockpit-audit-btn"
          onClick={handleRunAudit}
          disabled={isAuditing}
        >
          <RefreshCw size={14} className={isAuditing ? 'audit-spinning' : ''} />
          <span>{isAuditing ? 'Evaluating Vectored Telemetry…' : 'Run Live Diagnostic'}</span>
        </button>
      </div>
    </div>
  )
}
