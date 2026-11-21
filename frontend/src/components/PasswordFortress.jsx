import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Shield, Sparkles, Check, X, RefreshCw, Lock, Unlock, Zap, Clock } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const SILLY_WORDS = ['Laser', 'Taco', 'Dragon', 'Pancake', 'Ninja', 'Galaxy', 'Cheetah', 'Robot', 'Bubble', 'Meteor']

export default function PasswordFortress() {
  const [password, setPassword] = useState('Pikachu#2026!')

  // Calculate cracking time & fortress tier
  const analysis = useMemo(() => {
    const pwd = password
    const len = pwd.length
    const hasLower = /[a-z]/.test(pwd)
    const hasUpper = /[A-Z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd)

    let charset = 0
    if (hasLower) charset += 26
    if (hasUpper) charset += 26
    if (hasNumber) charset += 10
    if (hasSymbol) charset += 32

    let entropy = len * Math.log2(Math.max(charset, 1))

    let timeText = '0.0001 seconds'
    let funnyQuote = 'A sleepy hamster could crack this before breakfast!'
    let tier = 1
    let tierName = 'Straw & Wood Fence'
    let tierColor = '#EF4444' // Red

    if (len === 0) {
      timeText = 'Instant'
      funnyQuote = 'Type any phrase above to start building your fortress!'
      tier = 0
      tierName = 'No Armor'
      tierColor = '#64748B'
    } else if (entropy < 28) {
      timeText = '0.002 seconds'
      funnyQuote = 'A sneeze lasts longer than this password!'
      tier = 1
      tierName = 'Straw & Wood Fence'
      tierColor = '#EF4444'
    } else if (entropy < 42) {
      timeText = '12 minutes'
      funnyQuote = 'A hacker could crack this while you watch one cartoon episode!'
      tier = 2
      tierName = 'Stone Castle Wall'
      tierColor = '#F59E0B'
    } else if (entropy < 60) {
      timeText = '4 years'
      funnyQuote = 'Tougher than a diamond-coated backpack! Pretty solid armor.'
      tier = 3
      tierName = 'Iron & Steel Keep'
      tierColor = '#06B6D4'
    } else {
      timeText = '85,000 YEARS'
      funnyQuote = '🚀 UNBREAKABLE! Aliens will visit Earth before anyone cracks this fortress!'
      tier = 4
      tierName = 'Quantum Cyber Forcefield'
      tierColor = '#10B981'
    }

    return {
      len,
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      timeText,
      funnyQuote,
      tier,
      tierName,
      tierColor,
      isSolidLength: len >= 12,
    }
  }, [password])

  const handleGenerateStrong = () => {
    cyberSound.playFanfare()
    const w1 = SILLY_WORDS[Math.floor(Math.random() * SILLY_WORDS.length)]
    const w2 = SILLY_WORDS[Math.floor(Math.random() * SILLY_WORDS.length)]
    const num = Math.floor(Math.random() * 89 + 10)
    const syms = ['#', '!', '$', '*', '@']
    const sym = syms[Math.floor(Math.random() * syms.length)]
    setPassword(`${w1}${sym}${w2}!${num}`)
  }

  const handlePreset = (preset) => {
    cyberSound.playClick()
    setPassword(preset)
  }

  return (
    <div className="password-fortress-card">
      {/* FORTRESS HEAD */}
      <div className="fortress-header">
        <div className="fortress-badge">
          <Shield size={15} /> PASSWORD FORTRESS · DEFENSE METER
        </div>
        <span className="fortress-tier-tag" style={{ borderColor: analysis.tierColor, color: analysis.tierColor }}>
          TIER {analysis.tier}: {analysis.tierName.toUpperCase()}
        </span>
      </div>

      <div className="fortress-intro">
        <h3>How Tough Is Your Secret Fortress?</h3>
        <p>Type a passphrase below or pick one to see how long it takes a supercomputer to break in.</p>
      </div>

      {/* QUICK PRESETS */}
      <div className="preset-row">
        <span className="preset-label">Test Silly Passwords:</span>
        <button type="button" className="preset-btn weak" onClick={() => handlePreset('123456')}>
          "123456"
        </button>
        <button type="button" className="preset-btn weak" onClick={() => handlePreset('superman')}>
          "superman"
        </button>
        <button type="button" className="preset-btn fair" onClick={() => handlePreset('Dragon123')}>
          "Dragon123"
        </button>
        <button type="button" className="preset-btn strong" onClick={() => handlePreset('Neon#Cheetah!88')}>
          "Neon#Cheetah!88"
        </button>
      </div>

      {/* INPUT FIELD WITH INTERACTIVE LOCK */}
      <div className="fortress-input-wrap">
        <div className="fortress-icon-slot">
          {analysis.tier >= 3 ? <Lock size={20} style={{ color: '#10B981' }} /> : <Unlock size={20} style={{ color: '#F59E0B' }} />}
        </div>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type your secret password or phrase..."
          className="fortress-input"
          maxLength={40}
        />
        <button
          type="button"
          className="fortress-gen-btn"
          onClick={handleGenerateStrong}
          title="Create an unbreakable 3-word passphrase!"
        >
          <Sparkles size={15} />
          <span>Surprise Me!</span>
        </button>
      </div>

      {/* TIME-TO-CRACK HERO GAUGE */}
      <div className="crack-time-display" style={{ background: `linear-gradient(135deg, ${analysis.tierColor}15, rgba(15, 23, 42, 0.9))` }}>
        <div className="time-metric">
          <span className="time-label"><Clock size={14} /> Time for a Hacker to Crack:</span>
          <strong className="time-value" style={{ color: analysis.tierColor }}>{analysis.timeText}</strong>
        </div>
        <p className="time-funny-quote">"{analysis.funnyQuote}"</p>
      </div>

      {/* 4-TIER FORTRESS WALL VISUALIZER */}
      <div className="fortress-wall-grid">
        {[
          { level: 1, label: 'Wood Fence', icon: '🪵', desc: 'Cracked in seconds' },
          { level: 2, label: 'Stone Wall', icon: '🧱', desc: 'Cracked in minutes' },
          { level: 3, label: 'Iron Keep', icon: '🏰', desc: 'Takes years' },
          { level: 4, label: 'Plasma Shield', icon: '⚡', desc: '40,000+ years' },
        ].map((block) => {
          const isActive = analysis.tier >= block.level
          return (
            <div
              key={block.level}
              className={`wall-block ${isActive ? 'wall-active' : ''}`}
              style={{
                borderColor: isActive ? analysis.tierColor : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isActive && analysis.tier === block.level ? `0 0 16px ${analysis.tierColor}40` : 'none',
              }}
            >
              <span className="wall-icon">{block.icon}</span>
              <strong>{block.label}</strong>
              <small>{block.desc}</small>
            </div>
          )
        })}
      </div>

      {/* INGREDIENT CHECKLIST */}
      <div className="fortress-checklist">
        <span className="checklist-title">Shield Armor Ingredients:</span>
        <div className="checklist-items">
          <span className={`check-chip ${analysis.isSolidLength ? 'chip-ok' : ''}`}>
            {analysis.isSolidLength ? <Check size={13} /> : <X size={13} />} 12+ Letters
          </span>
          <span className={`check-chip ${analysis.hasUpper && analysis.hasLower ? 'chip-ok' : ''}`}>
            {analysis.hasUpper && analysis.hasLower ? <Check size={13} /> : <X size={13} />} BIG & small letters
          </span>
          <span className={`check-chip ${analysis.hasNumber ? 'chip-ok' : ''}`}>
            {analysis.hasNumber ? <Check size={13} /> : <X size={13} />} Numbers (1-9)
          </span>
          <span className={`check-chip ${analysis.hasSymbol ? 'chip-ok' : ''}`}>
            {analysis.hasSymbol ? <Check size={13} /> : <X size={13} />} Symbols (!, #, $)
          </span>
        </div>
      </div>
    </div>
  )
}
