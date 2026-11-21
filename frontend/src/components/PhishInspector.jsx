import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Search, AlertTriangle, ExternalLink, ArrowRight, Zap, RefreshCw } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const SAMPLES = [
  {
    name: 'Urgent Bank KYC',
    url: 'http://sbi-kyc-update-pan.top/login.php',
    score: 96,
    verdict: 'CRITICAL PHISHING THREAT',
    type: 'danger',
    flags: [
      'Insecure HTTP connection without SSL encryption',
      'Deceptive typo-squatted domain (.top TLD instead of official .sbi / .co.in)',
      'Keyword trap: "kyc-update" used to trigger panic',
      'Direct form target sends bank credentials to unverified server',
    ],
    safeAdvice: 'Banks never ask you to update KYC via third-party SMS links or unverified .top domains.',
  },
  {
    name: 'UPI Cashback Trap',
    url: 'upi://pay?pa=refund-desk@ybl&pn=InstantCashback&am=4999',
    score: 92,
    verdict: 'PAYMENT REVERSAL FRAUD',
    type: 'danger',
    flags: [
      'Deceptive "Cashback" label attached to an OUTGOING payment collect request',
      'Rule #1 of UPI violated: You NEVER enter UPI PIN or approve a request to receive funds',
      'Virtual Payment Address (VPA) registered to private individual, not bank merchant',
    ],
    safeAdvice: 'Reject this collect request immediately. To receive money on UPI, no action or PIN is required.',
  },
  {
    name: 'Suspicious Work-From-Home Link',
    url: 'https://tinyurl.com/yt-like-earn-daily',
    score: 84,
    verdict: 'SUSPICIOUS RECRUITMENT LURE',
    type: 'warning',
    flags: [
      'Masked URL shortener hiding true destination domain',
      'High-risk promise of passive daily income for simple social tasks',
      'Redirects to unmonitored messaging channels requesting security deposit fees',
    ],
    safeAdvice: 'Legitimate employers never ask for prepaid deposits or task registration fees.',
  },
  {
    name: 'Official Google Auth',
    url: 'https://accounts.google.com/ServiceLogin',
    score: 0,
    verdict: 'VERIFIED LEGITIMATE DOMAIN',
    type: 'safe',
    flags: [
      'Official root domain: google.com with valid Extended Validation SSL certificate',
      'Protected by Google identity security infrastructure & hardware MFA support',
      'No deceptive subdomains or suspicious redirects detected',
    ],
    safeAdvice: 'Always verify the exact address bar domain says "google.com" before typing credentials.',
  },
]

export default function PhishInspector() {
  const [currentUrl, setCurrentUrl] = useState(SAMPLES[0].url)
  const [activeAnalysis, setActiveAnalysis] = useState(SAMPLES[0])
  const [isScanning, setIsScanning] = useState(false)

  const handleSelectSample = (sample) => {
    cyberSound.playClick()
    setCurrentUrl(sample.url)
    runAnalysis(sample.url, sample)
  }

  const runAnalysis = (urlToAnalyze, preset = null) => {
    setIsScanning(true)
    cyberSound.playScan()

    setTimeout(() => {
      setIsScanning(false)
      if (preset) {
        setActiveAnalysis(preset)
        if (preset.score > 50) cyberSound.playError()
        else cyberSound.playSuccess()
      } else {
        // Custom heuristic analysis for user input
        const lower = urlToAnalyze.toLowerCase()
        const isHttp = lower.startsWith('http://')
        const hasSuspiciousTLD = /\.(xyz|top|work|click|info|cc|buzz|tk|ml)\b/.test(lower)
        const hasUrgencyWords = /(kyc|update|urgent|verify|bonus|reward|win|cashback|free|lottery)/.test(lower)
        const isOfficial = /(google\.com|github\.com|sbi\.co\.in|microsoft\.com|apple\.com)/.test(lower)

        let calculatedScore = 15
        const customFlags = []

        if (isHttp) {
          calculatedScore += 30
          customFlags.push('Insecure connection (HTTP): Data transmitted in cleartext.')
        }
        if (hasSuspiciousTLD) {
          calculatedScore += 35
          customFlags.push('Suspicious domain extension frequently leveraged in automated phish campaigns.')
        }
        if (hasUrgencyWords) {
          calculatedScore += 25
          customFlags.push('Contains social engineering trigger keywords (KYC, urgent, reward).')
        }
        if (isOfficial) {
          calculatedScore = 0
          customFlags.push('Matches recognized authenticated organization domain pattern.')
        }

        const score = Math.min(99, Math.max(0, calculatedScore))
        const verdict = score > 60 ? 'CRITICAL PHISHING THREAT' : score > 25 ? 'SUSPICIOUS LINK PATTERN' : 'SAFE DOMAIN PATTERN'
        const type = score > 60 ? 'danger' : score > 25 ? 'warning' : 'safe'

        const result = {
          name: 'Custom Inspection',
          url: urlToAnalyze,
          score,
          verdict,
          type,
          flags: customFlags.length > 0 ? customFlags : ['Standard domain syntax. Always check browser SSL padlock.'],
          safeAdvice: score > 50 ? 'Avoid clicking this link or entering phone numbers, OTPs, or passwords.' : 'Looks relatively clean, but remain vigilant.',
        }

        setActiveAnalysis(result)
        if (score > 50) cyberSound.playError()
        else cyberSound.playSuccess()
      }
    }, 450)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!currentUrl.trim()) return
    runAnalysis(currentUrl)
  }

  return (
    <div className="phish-inspector-card">
      <div className="inspector-head">
        <div className="inspector-badge">
          <Zap size={14} /> LIVE THREAT DETECTOR
        </div>
        <h3>Scam & URL Inspector</h3>
        <p>Test real-world links and deceptive messages to expose hidden social engineering vectors.</p>
      </div>

      <div className="sample-chips">
        <span className="sample-label">Quick Test Lures:</span>
        {SAMPLES.map((s, idx) => (
          <button
            key={idx}
            type="button"
            className={`sample-chip ${s.type}`}
            onClick={() => handleSelectSample(s)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <form className="inspector-input-box" onSubmit={handleFormSubmit}>
        <Search className="inspector-search-icon" size={17} />
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          placeholder="Paste any link, domain, or message here to inspect..."
          className="inspector-input"
        />
        <button type="submit" className="button button-primary button-small" disabled={isScanning}>
          {isScanning ? 'Scanning...' : 'Inspect'} <ArrowRight size={14} />
        </button>
      </form>

      {/* RESULT CARD */}
      <div className={`inspector-result-box ${activeAnalysis.type}`}>
        <div className="result-top">
          <div className="result-status">
            {activeAnalysis.type === 'danger' && <ShieldAlert size={28} className="icon-danger" />}
            {activeAnalysis.type === 'warning' && <AlertTriangle size={28} className="icon-warning" />}
            {activeAnalysis.type === 'safe' && <ShieldCheck size={28} className="icon-safe" />}
            <div>
              <span className="result-verdict">{activeAnalysis.verdict}</span>
              <p className="result-tested-url">{activeAnalysis.url}</p>
            </div>
          </div>
          <div className="threat-gauge">
            <span className="gauge-number">{activeAnalysis.score}%</span>
            <span className="gauge-label">THREAT SCORE</span>
          </div>
        </div>

        <div className="gauge-bar-wrapper">
          <div
            className={`gauge-bar-fill ${activeAnalysis.type}`}
            style={{ width: `${activeAnalysis.score}%` }}
          />
        </div>

        <div className="result-flags">
          <h4>Detected Red Flags & Heuristics:</h4>
          <ul>
            {activeAnalysis.flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>

        <div className="result-advice">
          <strong>Defensive Protocol:</strong> {activeAnalysis.safeAdvice}
        </div>
      </div>
    </div>
  )
}
