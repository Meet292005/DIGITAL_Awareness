import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Check, Lock, ArrowRight, Zap, Star, ShieldCheck } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const QUESTS = [
  {
    id: 1,
    slug: 'phishing-and-social-engineering',
    number: '01',
    title: 'The Scam Spotter Quest',
    badge: '🕵️',
    badgeName: 'Eagle Eye Detective',
    color: '#06B6D4',
    xp: 50,
    status: 'completed',
    desc: 'Unmask urgent fake emails, lookalike websites, and prize traps before clicking.',
    stars: 3,
  },
  {
    id: 2,
    slug: 'password-hygiene-and-authentication',
    number: '02',
    title: 'Password Fortress Forge',
    badge: '🏰',
    badgeName: 'Vault Master',
    color: '#8B5CF6',
    xp: 50,
    status: 'in-progress',
    desc: 'Craft super-memorable 3-word passphrases that take hackers 50,000 years to crack.',
    stars: 2,
  },
  {
    id: 3,
    slug: 'upi-and-digital-payment-safety',
    number: '03',
    title: 'The UPI Gold Shield',
    badge: '🛡️',
    badgeName: 'Payment Sentinel',
    color: '#10B981',
    xp: 50,
    status: 'unlocked',
    desc: 'Rule #1 of digital money: You NEVER enter your PIN to receive money or cashbacks.',
    stars: 1,
  },
  {
    id: 4,
    slug: 'device-security-and-updates',
    number: '04',
    title: 'Mystery DM Investigation',
    badge: '🦉',
    badgeName: 'Truth Seeker',
    color: '#F59E0B',
    xp: 50,
    status: 'locked',
    desc: 'Spot imposters pretending to be your friends asking for money or contest votes.',
    stars: 0,
  },
]

export default function QuestProgression() {
  const [activeQuest, setActiveQuest] = useState(QUESTS[0])

  return (
    <div className="quest-progression-wrapper">
      <div className="quest-header">
        <div>
          <span className="quest-eyebrow"><Award size={14} /> ADVENTURE ROADMAP</span>
          <h2>Cyber Defender Quests</h2>
          <p>Clear fun field challenges, earn XP, and collect legendary cyber badges!</p>
        </div>
        <Link to="/learn" className="tactile-btn tactile-secondary-btn" onClick={() => cyberSound.playClick()}>
          <span>View All 10 Quests</span> <ArrowRight size={15} />
        </Link>
      </div>

      <div className="quest-grid">
        {QUESTS.map((quest) => {
          const isCompleted = quest.status === 'completed'
          const isInProgress = quest.status === 'in-progress'
          const isLocked = quest.status === 'locked'

          return (
            <div
              key={quest.id}
              className={`quest-card ${quest.status}`}
              style={{
                borderColor: isInProgress ? quest.color : isCompleted ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
              }}
              onMouseEnter={() => cyberSound.playClick()}
            >
              {/* TOP STRIP */}
              <div className="quest-card-top">
                <span className="quest-num">STAGE {quest.number}</span>
                <span className="quest-xp-badge">
                  <Zap size={13} /> +{quest.xp} XP
                </span>
              </div>

              {/* COLLECTIBLE 3D BADGE */}
              <div
                className="quest-badge-slot"
                style={{
                  background: `radial-gradient(circle, ${quest.color}25 0%, rgba(15, 23, 42, 0.4) 70%)`,
                  borderColor: quest.color,
                }}
              >
                <span className="badge-emoji">{quest.badge}</span>
                {isCompleted && (
                  <span className="badge-check-tag">
                    <Check size={12} />
                  </span>
                )}
                {isLocked && (
                  <span className="badge-lock-tag">
                    <Lock size={12} />
                  </span>
                )}
              </div>

              <div className="quest-info">
                <h3>{quest.title}</h3>
                <span className="badge-title-pill" style={{ color: quest.color }}>
                  Reward: {quest.badgeName}
                </span>
                <p>{quest.desc}</p>
              </div>

              {/* STAR RATING */}
              <div className="quest-stars">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={star <= quest.stars ? 'star-gold' : 'star-muted'}
                  />
                ))}
              </div>

              {/* ACTION BUTTON */}
              <div className="quest-action-slot">
                {isCompleted ? (
                  <Link
                    to={`/learn/${quest.slug}`}
                    className="quest-btn btn-completed"
                    onClick={() => cyberSound.playClick()}
                  >
                    <Check size={14} /> Cleared · Replay
                  </Link>
                ) : isInProgress ? (
                  <Link
                    to={`/learn/${quest.slug}`}
                    className="quest-btn btn-active"
                    style={{ background: quest.color }}
                    onClick={() => cyberSound.playClick()}
                  >
                    Play Quest Now 🚀
                  </Link>
                ) : (
                  <Link
                    to={`/learn/${quest.slug}`}
                    className="quest-btn btn-start"
                    onClick={() => cyberSound.playClick()}
                  >
                    Start Mission
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
