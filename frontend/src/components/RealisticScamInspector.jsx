import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ShieldCheck, Search, AlertTriangle, ExternalLink, ArrowRight, CheckCircle2, FileText, Lock } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const INCIDENTS = [
  {
    id: 'm365',
    title: 'Executive Phishing Lure · Microsoft 365 Spoof',
    sender: 'IT-Security-Desk <no-reply@micros0ft-support-portal.cloud>',
    recipient: 'user@enterprise.org',
    date: 'Today, 09:42 AM',
    subject: 'Action Required: Mandatory Multi-Factor Security Re-Authentication',
    spf: 'FAIL (Sender IP unverified)',
    dmarc: 'REJECT (Domain alignment mismatch)',
    tls: 'None (Unencrypted Transmission)',
    clues: {
      domain: {
        title: 'Homoglyph Domain Typosquatting',
        evidence: 'micros0ft-support-portal.cloud (Numeral "0" used instead of letter "o")',
        impact: 'Deceptive resemblance engineered to bypass casual visual inspection.',
      },
      headers: {
        title: 'SPF & DMARC Cryptographic Failure',
        evidence: 'SPF: FAIL · Sender server IP 185.220.101.4 is not authorized for microsoft.com',
        impact: 'Cryptographic proof that the sender identity is forged.',
      },
      link: {
        title: 'Credential Harvester Endpoint',
        evidence: 'Destination URI: http://corporate-login-sso.xyz/session/login.php',
        impact: 'Unencrypted HTTP transport routing credentials to an adversary-controlled server.',
      },
    },
  },
  {
    id: 'banking',
    title: 'Urgent Financial Threat · UPI Reversal Scam',
    sender: 'Bank Alerts <service@hdfc-pan-update-desk.top>',
    recipient: '+91 98765 43210',
    date: 'Today, 11:15 AM',
    subject: 'Urgent: Complete KYC within 4 hours or bank account will be frozen',
    spf: 'FAIL',
    dmarc: 'FAIL',
    tls: 'HTTP Cleartext',
    clues: {
      domain: {
        title: 'Rogue High-Risk TLD (.top)',
        evidence: 'hdfc-pan-update-desk.top (Unofficial third-party domain registrar)',
        impact: 'Official commercial banks exclusively operate on verified corporate domains.',
      },
      headers: {
        title: 'Psychological Coercion & Artificial Urgency',
        evidence: 'Demands action within 4 hours under threat of frozen financial assets',
        impact: 'Designed to induce panic and force bypass of normal verification procedures.',
      },
      link: {
        title: 'UPI Reverse Collect Trap',
        evidence: 'Directs victim to scan QR code or input 6-digit MPIN to "verify identity"',
        impact: 'Rule of Payment Gateways: Inputting an MPIN strictly authorizes an OUTGOING debit.',
      },
    },
  },
]

export default function RealisticScamInspector() {
  const [incidentIdx, setIncidentIdx] = useState(0)
  const [activeAnalysisKey, setActiveAnalysisKey] = useState('domain')

  const incident = INCIDENTS[incidentIdx]
  const analysis = incident.clues[activeAnalysisKey]

  const handleSelectIncident = (idx) => {
    cyberSound.playClick()
    setIncidentIdx(idx)
    setActiveAnalysisKey('domain')
  }

  const handleSelectClue = (key) => {
    cyberSound.playClick()
    setActiveAnalysisKey(key)
  }

  return (
    <div className="realistic-inspector-card">
      {/* HEADER */}
      <div className="inspector-topbar">
        <div className="inspector-title-group">
          <span className="inspector-pill">
            <Search size={14} /> LIVE INCIDENT INVESTIGATION
          </span>
          <h3>Threat Artifact Dissector</h3>
        </div>
        <div className="inspector-switcher">
          {INCIDENTS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`switcher-pill ${idx === incidentIdx ? 'switcher-active' : ''}`}
              onClick={() => handleSelectIncident(idx)}
            >
              Case #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      <p className="inspector-subtitle">
        Examine real forensic indicators from active credential harvesting and payment fraud campaigns.
      </p>

      {/* SIMULATED ENTERPRISE MAIL CLIENT */}
      <div className="realistic-mail-frame">
        <div className="mail-header-bar">
          <div className="mail-field">
            <span className="field-name">From:</span>
            <button
              type="button"
              className={`inspect-highlight-chip ${activeAnalysisKey === 'domain' ? 'chip-active' : ''}`}
              onClick={() => handleSelectClue('domain')}
            >
              <span>{incident.sender}</span>
              <span className="threat-tag">FLAGGED</span>
            </button>
          </div>

          <div className="mail-field">
            <span className="field-name">Auth Status:</span>
            <button
              type="button"
              className={`inspect-highlight-chip ${activeAnalysisKey === 'headers' ? 'chip-active' : ''}`}
              onClick={() => handleSelectClue('headers')}
            >
              <span>SPF: {incident.spf} · DMARC: {incident.dmarc}</span>
              <span className="threat-tag">SPOOFED</span>
            </button>
          </div>

          <div className="mail-field">
            <span className="field-name">Subject:</span>
            <span className="field-value font-semibold text-white">{incident.subject}</span>
          </div>
        </div>

        {/* EMAIL BODY WITH INTERACTIVE LINK */}
        <div className="mail-body-content">
          <p>Dear Valued User,</p>
          <p>
            Our security automated telemetry has detected unverified sign-in attempts on your account. To maintain active directory privileges, you must verify your credentials immediately.
          </p>

          <div className="mail-cta-block">
            <button
              type="button"
              className={`inspect-link-chip ${activeAnalysisKey === 'link' ? 'chip-active' : ''}`}
              onClick={() => handleSelectClue('link')}
            >
              <ExternalLink size={14} />
              <span>Verify Account Credentials (corporate-login-sso.xyz)</span>
              <span className="threat-tag">MALICIOUS</span>
            </button>
          </div>

          <p className="mail-disclaimer">
            Failure to complete verification within the allocated window will result in administrative account suspension.
          </p>
        </div>
      </div>

      {/* FORENSIC DEBRIEF BOX */}
      <div className="forensic-debrief-card">
        <div className="debrief-head">
          <ShieldAlert size={18} className="text-rose-400" />
          <h4>Forensic Finding: {analysis.title}</h4>
        </div>

        <div className="debrief-evidence">
          <strong>Technical Evidence:</strong>
          <code>{analysis.evidence}</code>
        </div>

        <div className="debrief-impact">
          <strong>Defensive Protocol:</strong>
          <span>{analysis.impact}</span>
        </div>
      </div>
    </div>
  )
}
