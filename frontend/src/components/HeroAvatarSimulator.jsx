import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, Zap, Award, Check, RefreshCw } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const AVATARS = [
  {
    id: 'fox',
    name: 'Cyber Fox',
    role: 'Agile Scout',
    icon: '🦊',
    color: '#F97316',
    specialty: 'Spots sneaky traps & trick links',
  },
  {
    id: 'robot',
    name: 'Robo Sentry',
    role: 'Firewall Bot',
    icon: '🤖',
    color: '#06B6D4',
    specialty: 'Blocks malware & unauthorized downloads',
  },
  {
    id: 'owl',
    name: 'Shadow Owl',
    role: 'Night Vision',
    icon: '🦉',
    color: '#8B5CF6',
    specialty: 'Decrypts passwords & protects privacy',
  },
  {
    id: 'dragon',
    name: 'Neon Dragon',
    role: 'Titan Defender',
    icon: '🐲',
    color: '#10B981',
    specialty: 'Unbreakable 2FA & payment security',
  },
]

const SHIELD_TIERS = [
  { level: 1, title: 'Rookie Scout', points: 120, phishBlock: '65%', armor: 'Wooden Buckler' },
  { level: 2, title: 'Code Cadet', points: 280, phishBlock: '78%', armor: 'Reinforced Steel' },
  { level: 3, title: 'Cyber Vanguard', points: 550, phishBlock: '89%', armor: 'Laser Grid' },
  { level: 4, title: 'Master Sentinel', points: 900, phishBlock: '96%', armor: 'Titanium Vault' },
  { level: 5, title: 'Invincible Guardian', points: 1500, phishBlock: '99.9%', armor: 'Quantum Forcefield' },
]

export default function HeroAvatarSimulator() {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [shieldTierIndex, setShieldTierIndex] = useState(2) // Level 3 default
  const [isPoweringUp, setIsPoweringUp] = useState(false)

  const currentTier = SHIELD_TIERS[shieldTierIndex]

  const handleSelectAvatar = (avatar) => {
    cyberSound.playClick()
    setSelectedAvatar(avatar)
  }

  const handlePowerBoost = () => {
    cyberSound.playScan()
    setIsPoweringUp(true)
    setTimeout(() => {
      setShieldTierIndex((prev) => {
        const next = (prev + 1) % SHIELD_TIERS.length
        if (next === SHIELD_TIERS.length - 1) {
          cyberSound.playFanfare()
        } else {
          cyberSound.playSuccess()
        }
        return next
      })
      setIsPoweringUp(false)
    }, 350)
  }

  return (
    <div className="hero-avatar-simulator">
      {/* SIMULATOR HEADER */}
      <div className="simulator-top">
        <div className="simulator-badge">
          <Sparkles size={14} /> LIVE DEFENDER PREVIEW
        </div>
        <span className="simulator-level-pill">
          LVL {currentTier.level} · {currentTier.title}
        </span>
      </div>

      {/* AVATAR HERO STAGE */}
      <div className="avatar-stage">
        {/* GLOWING SHIELD RINGS */}
        <motion.div
          className="shield-glow-ring"
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.6, 0.9, 0.6],
            borderColor: selectedAvatar.color,
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ borderColor: selectedAvatar.color }}
        />

        {/* 3D AVATAR ICON */}
        <motion.div
          key={selectedAvatar.id}
          className="avatar-emoji-display"
          initial={{ scale: 0.7, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        >
          <span className="avatar-emoji" role="img" aria-label={selectedAvatar.name}>
            {selectedAvatar.icon}
          </span>
          <div className="avatar-sparkle-dot top-right" />
          <div className="avatar-sparkle-dot bottom-left" />
        </motion.div>

        {/* STATS OVERLAY CHIP */}
        <div className="avatar-name-plate">
          <h4>{selectedAvatar.name}</h4>
          <p>{selectedAvatar.role} · {selectedAvatar.specialty}</p>
        </div>
      </div>

      {/* CHOOSE OPERATIVE AVATAR ROW */}
      <div className="avatar-picker-wrap">
        <span className="picker-label">Choose Your Cyber Operative:</span>
        <div className="avatar-picker-row">
          {AVATARS.map((av) => {
            const isSelected = av.id === selectedAvatar.id
            return (
              <button
                key={av.id}
                type="button"
                className={`avatar-choice-btn ${isSelected ? 'choice-selected' : ''}`}
                style={{
                  borderColor: isSelected ? av.color : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? `0 0 16px ${av.color}40, 0 4px 0 ${av.color}` : '0 3px 0 rgba(0,0,0,0.3)',
                }}
                onClick={() => handleSelectAvatar(av)}
                aria-label={`Select ${av.name}`}
              >
                <span className="choice-emoji">{av.icon}</span>
                <span className="choice-name">{av.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* SHIELD POWER BAR & LEVEL BOOST BUTTON */}
      <div className="shield-meter-card">
        <div className="shield-meter-header">
          <div className="meter-label-wrap">
            <Shield size={16} style={{ color: selectedAvatar.color }} />
            <span>Cyber Shield Armor: <strong>{currentTier.armor}</strong></span>
          </div>
          <span className="meter-percent-badge">{currentTier.phishBlock} Block Rate</span>
        </div>

        {/* 5-SEGMENT LEVEL BARS */}
        <div className="shield-level-segments">
          {SHIELD_TIERS.map((tier, i) => (
            <div
              key={tier.level}
              className={`shield-segment ${i <= shieldTierIndex ? 'segment-filled' : ''}`}
              style={{
                backgroundColor: i <= shieldTierIndex ? selectedAvatar.color : 'rgba(255, 255, 255, 0.08)',
                boxShadow: i <= shieldTierIndex ? `0 0 8px ${selectedAvatar.color}60` : 'none',
              }}
            />
          ))}
        </div>

        {/* TACTILE 3D BOOST BUTTON */}
        <button
          type="button"
          className="tactile-btn tactile-boost-btn"
          onClick={handlePowerBoost}
          disabled={isPoweringUp}
          aria-label="Power Up Cyber Shield Level"
        >
          <Zap size={16} />
          <span>{isPoweringUp ? 'Powering Up Shield…' : 'Tap to Power Up Shield! ⚡'}</span>
        </button>
      </div>
    </div>
  )
}
