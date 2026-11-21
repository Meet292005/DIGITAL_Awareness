import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Clock, Target, Award, CheckCircle2, ChevronRight, Lock, BookOpen } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const TRACKS = [
  {
    id: 1,
    slug: 'phishing-and-social-engineering',
    number: '01',
    title: 'Phishing & Impersonation Defense',
    standard: 'NIST SP 800-63B',
    category: 'IDENTITY VECTORS',
    duration: '10 min',
    color: '#10B981', // Emerald
    description: 'Master instantaneous visual detection of homoglyph domains, deceptive sender headers, and urgent panic bait.',
    skills: ['Domain Header Inspection', 'Urgency Deconstruction', 'Credential Safeguards'],
  },
  {
    id: 2,
    slug: 'password-hygiene-and-authentication',
    number: '02',
    title: 'Authentication & Credential Hardening',
    standard: 'FIDO2 / PASSKEYS',
    category: 'ACCESS CONTROLS',
    duration: '12 min',
    color: '#6366F1', // Indigo
    description: 'Implement high-entropy cryptographic passphrases, passkey deployment, and hardware security token protocols.',
    skills: ['Entropy Optimization', 'Passkey Architecture', 'MFA Interception Defenses'],
  },
  {
    id: 3,
    slug: 'upi-and-digital-payment-safety',
    number: '03',
    title: 'Payment & Transaction Security',
    standard: 'PCI-DSS v4.0',
    category: 'FINANCIAL DEFENSE',
    duration: '8 min',
    color: '#06B6D4', // Cyan
    description: 'Enforce the non-negotiable payment gateway rule: MPIN authorization strictly sends funds; receiving money never requires a PIN.',
    skills: ['UPI Reverse-Debit Neutralization', 'QR Verification', 'VPA Validation'],
  },
  {
    id: 4,
    slug: 'device-security-and-updates',
    number: '04',
    title: 'Endpoint & Network Hardening',
    standard: 'ZERO-TRUST ARCHITECTURE',
    category: 'PERIMETER DEFENSE',
    duration: '15 min',
    color: '#F59E0B', // Amber
    description: 'Audit mobile application permissions, encrypt transit across public Wi-Fi, and mitigate rogue screen-sharing exploits.',
    skills: ['Transit Encryption (VPN/DoH)', 'Permission Containment', 'Remote Access Safeguards'],
  },
]

export default function RealisticCurriculumMap() {
  return (
    <div className="curriculum-map-container">
      <div className="curriculum-header">
        <div>
          <span className="curriculum-eyebrow">
            <Target size={14} /> DEFENSIVE TRAINING SYLLABUS
          </span>
          <h2>Field-Tested Cybersecurity Curriculum</h2>
          <p>
            Interactive learning tracks engineered from verified fraud telemetry. Build genuine, instinctive defenses against sophisticated exploits.
          </p>
        </div>
        <Link
          to="/learn"
          className="curriculum-all-link"
          onClick={() => cyberSound.playClick()}
        >
          <span>Explore All 10 Tracks</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="tracks-grid">
        {TRACKS.map((track) => (
          <div
            key={track.id}
            className="track-card"
            style={{
              '--track-accent': track.color,
            }}
            onMouseEnter={() => cyberSound.playClick()}
          >
            <div className="track-top">
              <span className="track-number">TRACK {track.number}</span>
              <span className="track-standard-badge" style={{ color: track.color }}>
                {track.standard}
              </span>
            </div>

            <div className="track-main">
              <span className="track-category">{track.category}</span>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
            </div>

            <div className="track-skills-list">
              {track.skills.map((skill, i) => (
                <span key={i} className="skill-pill">
                  <CheckCircle2 size={12} style={{ color: track.color }} />
                  <span>{skill}</span>
                </span>
              ))}
            </div>

            <div className="track-footer">
              <span className="track-duration">
                <Clock size={13} /> {track.duration} interactive run
              </span>
              <Link
                to={`/learn/${track.slug}`}
                className="track-cta-btn"
                style={{ background: track.color }}
                onClick={() => cyberSound.playClick()}
              >
                <span>Launch Track</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
