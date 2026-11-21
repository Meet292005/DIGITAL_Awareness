import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, CheckCircle2, Search, Sparkles, Award, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const SCENARIOS = [
  {
    id: 'vbucks',
    title: '🎮 The "Free Game Coins" Trap',
    context: 'Direct message received while playing an online multiplayer game',
    sender: 'EpicGamerRewards@free-vbucks-claim.xyz',
    time: '2 mins ago',
    subject: '🎉 YOU WON: 25,000 V-Bucks & Rare Cyber Skin!',
    clues: {
      sender: {
        id: 'sender',
        label: 'Suspicious Sender Email',
        text: 'EpicGamerRewards@free-vbucks-claim.xyz',
        explanation: '🚨 Red Flag #1: Real game studios never use strange domains like ".xyz". They use official company emails.',
      },
      urgency: {
        id: 'urgency',
        label: 'Fake Panic Countdown',
        text: '⏰ MUST CLAIM IN 4 MINUTES OR YOUR PRIZE EXPIRES FOREVER!',
        explanation: '🚨 Red Flag #2: Scammers create fake urgency so you rush and click before checking with a parent or teacher.',
      },
      link: {
        id: 'link',
        label: 'Password Harvester Link',
        text: 'http://login-claim-vbucks.xyz/steal-account.php',
        explanation: '🚨 Red Flag #3: This link starts with unencrypted "http://" and goes to a fake site built to steal your login and password.',
      },
    },
  },
  {
    id: 'school',
    title: '🏫 The "Urgent Homework Portal" Trap',
    context: 'SMS text message sent to a student phone after school hours',
    sender: '+1 (555) 019-9481 [School Admin Alert]',
    time: 'Just now',
    subject: '⚠️ STUDENT NOTICE: Immediate Action Required',
    clues: {
      sender: {
        id: 'sender',
        label: 'Random Phone Number',
        text: '+1 (555) 019-9481 [School Admin Alert]',
        explanation: '🚨 Red Flag #1: Your school communicates through official student portals, never from random overseas phone numbers.',
      },
      urgency: {
        id: 'urgency',
        label: 'Threat of Suspension',
        text: 'YOUR GRADES WILL BE LOCKED WITHIN 1 HOUR UNLESS RE-VERIFIED!',
        explanation: '🚨 Red Flag #2: Scammers use scary threats (getting in trouble) to make you panic and give up passwords.',
      },
      link: {
        id: 'link',
        label: 'Fake Login URL',
        text: 'http://my-school-grades-verify.net/auth',
        explanation: '🚨 Red Flag #3: Misspelled, unverified website. Always access school portals through your saved browser bookmarks.',
      },
    },
  },
]

export default function ScamSpotter() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [foundClues, setFoundClues] = useState(new Set())
  const [feedback, setFeedback] = useState('')

  const activeScenario = SCENARIOS[scenarioIndex]
  const allCluesCount = 3
  const isComplete = foundClues.size === allCluesCount

  const handleSpotClue = (clueKey) => {
    if (foundClues.has(clueKey)) {
      cyberSound.playClick()
      setFeedback(`You already spotted this clue: "${activeScenario.clues[clueKey].label}"!`)
      return
    }

    const updated = new Set(foundClues)
    updated.add(clueKey)
    setFoundClues(updated)

    if (updated.size === allCluesCount) {
      cyberSound.playFanfare()
      setFeedback('🏆 FANTASTIC DETECTIVE WORK! You caught all 3 scam red flags!')
    } else {
      cyberSound.playSuccess()
      setFeedback(`🔍 Great eye! ${activeScenario.clues[clueKey].explanation}`)
    }
  }

  const handleMissClick = () => {
    cyberSound.playClick()
    setFeedback('💡 That part looks normal. Click on the weird sender address, the scary urgent countdown, or the fishy web link!')
  }

  const handleReset = (nextIdx = null) => {
    cyberSound.playClick()
    setFoundClues(new Set())
    setFeedback('')
    if (nextIdx !== null) {
      setScenarioIndex(nextIdx)
    }
  }

  return (
    <div className="scam-spotter-card">
      {/* DETECTIVE HEADER */}
      <div className="spotter-header">
        <div className="spotter-badge">
          <Search size={15} /> SCAM SPOTTER · CYBER DETECTIVE LAB
        </div>
        <div className="spotter-scenario-toggle">
          {SCENARIOS.map((sc, i) => (
            <button
              key={sc.id}
              type="button"
              className={`scenario-pill ${i === scenarioIndex ? 'pill-active' : ''}`}
              onClick={() => handleReset(i)}
            >
              Case 0{i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="spotter-intro">
        <h3>{activeScenario.title}</h3>
        <p>A sneaky message just arrived. <strong>Find and click all 3 suspicious red flags</strong> hidden inside!</p>
      </div>

      {/* PROGRESS SCOREBOARD */}
      <div className="spotter-progress-strip">
        <div className="progress-left">
          <span>Clues Spotted: <strong>{foundClues.size} of {allCluesCount}</strong></span>
        </div>
        <div className="clue-dots">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`clue-dot ${i < foundClues.size ? 'dot-found' : ''}`}
            >
              {i < foundClues.size ? <CheckCircle2 size={14} /> : `0${i + 1}`}
            </span>
          ))}
        </div>
      </div>

      {/* SIMULATED PHONE / INBOX SCREEN */}
      <div className="fake-message-window" onClick={handleMissClick}>
        <div className="window-topbar">
          <div className="window-status-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span className="window-title-text">{activeScenario.context}</span>
        </div>

        <div className="message-envelope">
          {/* SENDER LINE (CLUE 1) */}
          <div className="msg-row">
            <span className="msg-label">From:</span>
            <button
              type="button"
              className={`clue-target-btn ${foundClues.has('sender') ? 'target-spotted' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleSpotClue('sender')
              }}
              aria-label="Inspect Sender Address"
            >
              {activeScenario.clues.sender.text}
              {foundClues.has('sender') && <span className="spotted-tag">✓ SPOTTED!</span>}
            </button>
          </div>

          <div className="msg-row">
            <span className="msg-label">Subject:</span>
            <span className="msg-subject">{activeScenario.subject}</span>
          </div>

          <div className="msg-divider" />

          {/* MESSAGE BODY WITH CLUES 2 & 3 */}
          <div className="msg-content-body">
            <p>Congratulations gamer! Your account was randomly selected for our seasonal mega-pack reward.</p>

            {/* URGENCY CLUE (CLUE 2) */}
            <div className="urgency-banner-wrap">
              <button
                type="button"
                className={`clue-target-btn urgency-btn ${foundClues.has('urgency') ? 'target-spotted' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpotClue('urgency')
                }}
                aria-label="Inspect Urgency Warning"
              >
                <AlertTriangle size={15} />
                <span>{activeScenario.clues.urgency.text}</span>
                {foundClues.has('urgency') && <span className="spotted-tag">✓ SPOTTED!</span>}
              </button>
            </div>

            <p>Click below and log in with your username and password to claim:</p>

            {/* DECEPTIVE LINK (CLUE 3) */}
            <div className="fake-link-wrap">
              <button
                type="button"
                className={`clue-target-btn fake-link-btn ${foundClues.has('link') ? 'target-spotted' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpotClue('link')
                }}
                aria-label="Inspect Suspicious Link"
              >
                👉 {activeScenario.clues.link.text}
                {foundClues.has('link') && <span className="spotted-tag">✓ SPOTTED!</span>}
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#64748B', marginTop: 14 }}>
              *Note: Do not share this private verification email with anyone.
            </p>
          </div>
        </div>
      </div>

      {/* DETECTIVE DEBRIEF FEEDBACK */}
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback}
            className={`detective-feedback-box ${isComplete ? 'feedback-win' : 'feedback-info'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {isComplete ? (
              <div className="win-content">
                <Award size={32} className="trophy-pulse" />
                <div>
                  <h4>🏅 Master Cyber Detective Badge Earned!</h4>
                  <p>You correctly spotted all 3 scam signals. Never click urgent links or trust strange email senders!</p>
                  <button
                    type="button"
                    className="tactile-btn tactile-small-btn"
                    onClick={() => handleReset((scenarioIndex + 1) % SCENARIOS.length)}
                  >
                    Play Next Case 🚀
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-content">
                <Sparkles size={20} />
                <span>{feedback}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
