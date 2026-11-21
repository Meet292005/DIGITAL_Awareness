export default function ModuleTopicVisual({ slug = '', category = '', title = '' }) {
  const s = (slug || '').toLowerCase()
  const c = (category || '').toLowerCase()

  // Match topic
  let topic = 'privacy'
  if (s.includes('upi') || s.includes('payment') || title.toLowerCase().includes('upi')) {
    topic = 'upi'
  } else if (s.includes('password') || title.toLowerCase().includes('password')) {
    topic = 'password'
  } else if (s.includes('identity') || title.toLowerCase().includes('personal details')) {
    topic = 'identity'
  } else if (s.includes('shopping') || title.toLowerCase().includes('shop online')) {
    topic = 'shopping'
  } else if (s.includes('bullying') || title.toLowerCase().includes('cyberbullying') || c.includes('wellbeing')) {
    topic = 'wellbeing'
  } else if (s.includes('job') || title.toLowerCase().includes('job offer')) {
    topic = 'job'
  } else if (s.includes('phish') || title.toLowerCase().includes('phish')) {
    topic = 'phishing'
  } else if (s.includes('browsing') || title.toLowerCase().includes('browse')) {
    topic = 'browsing'
  } else if (s.includes('social') || title.toLowerCase().includes('social')) {
    topic = 'social'
  } else if (s.includes('privacy') || title.toLowerCase().includes('footprint')) {
    topic = 'privacy'
  }

  // Topic-specific configurations
  const visuals = {
    privacy: {
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      badge: 'DIGITAL FOOTPRINT DEFENSE',
      accentColor: '#22d3ee',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Grid lines */}
          <line x1="20" y1="70" x2="260" y2="70" stroke="rgba(34, 211, 238, 0.15)" strokeDasharray="3 3" />
          <line x1="140" y1="10" x2="140" y2="130" stroke="rgba(34, 211, 238, 0.15)" strokeDasharray="3 3" />
          {/* Biometric circles */}
          <circle cx="140" cy="70" r="54" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="140" cy="70" r="42" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1.5" />
          <circle cx="140" cy="70" r="28" fill="rgba(6, 182, 212, 0.12)" stroke="#22d3ee" strokeWidth="2" />
          {/* Footprint / Fingerprint waves */}
          <path d="M128 62 C132 56, 148 56, 152 62" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M124 70 C130 64, 150 64, 156 70" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M128 78 C134 72, 146 72, 152 78" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="140" cy="84" r="3" fill="#00ff88" />
          {/* Satellite Shield Nodes */}
          <rect x="68" y="38" width="36" height="20" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" strokeWidth="1" />
          <text x="86" y="52" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="middle">VPN: ON</text>
          <rect x="176" y="82" width="46" height="20" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#34d399" strokeWidth="1" />
          <text x="199" y="96" fill="#34d399" fontSize="8" fontWeight="700" textAnchor="middle">NO LEAK</text>
        </svg>
      ),
    },
    identity: {
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.14) 100%)',
      borderColor: 'rgba(129, 140, 248, 0.35)',
      badge: 'IDENTITY VAULT & ZERO-TRUST',
      accentColor: '#818cf8',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Hologram Card Base */}
          <rect x="80" y="24" width="120" height="92" rx="12" fill="rgba(15, 23, 42, 0.9)" stroke="#818cf8" strokeWidth="1.5" />
          {/* Holographic Header bar */}
          <rect x="80" y="24" width="120" height="24" rx="12" fill="rgba(99, 102, 241, 0.25)" />
          {/* Microchip */}
          <rect x="94" y="56" width="22" height="18" rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
          <line x1="94" y1="62" x2="116" y2="62" stroke="#d97706" strokeWidth="1" />
          <line x1="94" y1="68" x2="116" y2="68" stroke="#d97706" strokeWidth="1" />
          {/* User Avatar Silhouette */}
          <circle cx="160" cy="62" r="12" fill="rgba(168, 85, 247, 0.3)" stroke="#c084fc" strokeWidth="1.5" />
          <path d="M146 88 C146 76, 174 76, 174 88" fill="rgba(168, 85, 247, 0.3)" stroke="#c084fc" strokeWidth="1.5" />
          {/* Padlock Seal */}
          <circle cx="104" cy="94" r="14" fill="#0f172a" stroke="#00ff88" strokeWidth="1.5" />
          <path d="M101 92 L101 88 C101 86, 107 86, 107 88 L107 92" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="98" y="92" width="12" height="9" rx="2" fill="#00ff88" />
          {/* Encrypted Pass Code */}
          <text x="160" y="104" fill="#818cf8" fontSize="8" fontWeight="800" letterSpacing="1">MFA ENFORCED</text>
        </svg>
      ),
    },
    shopping: {
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.14) 100%)',
      borderColor: 'rgba(52, 211, 153, 0.35)',
      badge: 'SAFE E-COMMERCE & ESCROW',
      accentColor: '#34d399',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Credit Card / Shopping Shield */}
          <rect x="75" y="30" width="130" height="80" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#34d399" strokeWidth="1.5" />
          <rect x="75" y="44" width="130" height="16" fill="rgba(52, 211, 153, 0.15)" />
          {/* Security Chip */}
          <rect x="92" y="68" width="20" height="16" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          {/* Verified Merchant Seal */}
          <circle cx="175" cy="76" r="16" fill="rgba(16, 185, 129, 0.2)" stroke="#00ff88" strokeWidth="1.5" />
          <path d="M168 76 L173 81 L183 71" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* HTTPS Pill */}
          <rect x="110" y="96" width="60" height="18" rx="9" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
          <text x="140" y="109" fill="#34d399" fontSize="8" fontWeight="800" textAnchor="middle">HTTPS // 256-BIT</text>
        </svg>
      ),
    },
    wellbeing: {
      gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(168, 85, 247, 0.14) 100%)',
      borderColor: 'rgba(251, 113, 133, 0.35)',
      badge: 'WELLBEING & ANTI-BULLYING',
      accentColor: '#fb7185',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Radiating concentric peace waves */}
          <circle cx="140" cy="70" r="56" stroke="rgba(251, 113, 133, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="140" cy="70" r="42" stroke="rgba(251, 113, 133, 0.25)" strokeWidth="1.5" />
          {/* Heart Armor Shield */}
          <path d="M140 36 C165 24, 180 50, 180 72 C180 98, 140 114, 140 114 C140 114, 100 98, 100 72 C100 50, 115 24, 140 36 Z" fill="rgba(15, 23, 42, 0.85)" stroke="#fb7185" strokeWidth="2" />
          {/* Inner Heart Peace Symbol */}
          <path d="M140 56 C148 48, 158 58, 158 66 C158 76, 140 86, 140 86 C140 86, 122 76, 122 66 C122 58, 132 48, 140 56 Z" fill="rgba(244, 63, 94, 0.3)" stroke="#fb7185" strokeWidth="1.5" />
          {/* Shield Action Badges */}
          <rect x="52" y="58" width="40" height="22" rx="6" fill="#0f172a" stroke="#fb7185" strokeWidth="1" />
          <text x="72" y="73" fill="#fb7185" fontSize="8" fontWeight="700" textAnchor="middle">BLOCK</text>
          <rect x="188" y="58" width="44" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <text x="210" y="73" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="middle">REPORT</text>
        </svg>
      ),
    },
    password: {
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.14) 100%)',
      borderColor: 'rgba(251, 191, 36, 0.35)',
      badge: 'HIGH-ENTROPY KEY VAULT',
      accentColor: '#fbbf24',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Vault Door Outer Ring */}
          <circle cx="140" cy="70" r="52" fill="rgba(15, 23, 42, 0.9)" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="140" cy="70" r="44" stroke="rgba(251, 191, 36, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
          {/* Dial Spokes */}
          <circle cx="140" cy="70" r="26" fill="rgba(245, 158, 11, 0.15)" stroke="#fbbf24" strokeWidth="2" />
          <line x1="140" y1="46" x2="140" y2="52" stroke="#fbbf24" strokeWidth="2" />
          <line x1="140" y1="88" x2="140" y2="94" stroke="#fbbf24" strokeWidth="2" />
          <line x1="116" y1="70" x2="122" y2="70" stroke="#fbbf24" strokeWidth="2" />
          <line x1="158" y1="70" x2="164" y2="70" stroke="#fbbf24" strokeWidth="2" />
          {/* Center Keyhole */}
          <circle cx="140" cy="67" r="5" fill="#fbbf24" />
          <polygon points="137,70 143,70 142,78 138,78" fill="#fbbf24" />
          {/* Password Asterisks Left & Right */}
          <rect x="48" y="58" width="56" height="24" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
          <text x="76" y="74" fill="#fbbf24" fontSize="11" fontWeight="900" textAnchor="middle">••••••••</text>
          <rect x="176" y="58" width="60" height="24" rx="6" fill="#0f172a" stroke="#00ff88" strokeWidth="1" />
          <text x="206" y="74" fill="#00ff88" fontSize="8" fontWeight="800" textAnchor="middle">100% ROBUST</text>
        </svg>
      ),
    },
    upi: {
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.16) 100%)',
      borderColor: 'rgba(248, 113, 113, 0.35)',
      badge: 'UPI PAYMENT FRAUD SHIELD',
      accentColor: '#f87171',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Phone Frame */}
          <rect x="95" y="18" width="90" height="106" rx="14" fill="rgba(15, 23, 42, 0.95)" stroke="#f87171" strokeWidth="1.8" />
          <line x1="125" y1="24" x2="155" y2="24" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          {/* QR Code Matrix Mockup */}
          <rect x="110" y="34" width="60" height="60" rx="6" fill="rgba(255, 255, 255, 0.08)" stroke="#f87171" strokeWidth="1" />
          <rect x="116" y="40" width="14" height="14" rx="2" fill="#ef4444" />
          <rect x="150" y="40" width="14" height="14" rx="2" fill="#ef4444" />
          <rect x="116" y="74" width="14" height="14" rx="2" fill="#ef4444" />
          <circle cx="140" cy="64" r="8" fill="#0f172a" stroke="#00ff88" strokeWidth="1.5" />
          <text x="140" y="68" fill="#00ff88" fontSize="10" fontWeight="900" textAnchor="middle">₹</text>
          {/* Green Laser Scanner Line */}
          <line x1="108" y1="62" x2="172" y2="62" stroke="#00ff88" strokeWidth="2" strokeDasharray="2 1" />
          {/* Critical UPI Rule Alert Banner */}
          <rect x="42" y="100" width="196" height="22" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
          <text x="140" y="114" fill="#fecaca" fontSize="8" fontWeight="800" textAnchor="middle">
            NEVER ENTER PIN TO RECEIVE MONEY
          </text>
        </svg>
      ),
    },
    job: {
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(56, 189, 248, 0.14) 100%)',
      borderColor: 'rgba(192, 132, 252, 0.35)',
      badge: 'FAKE RECRUITMENT DETECTOR',
      accentColor: '#c084fc',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Letter / Contract Mockup */}
          <rect x="90" y="24" width="100" height="92" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#c084fc" strokeWidth="1.5" />
          <line x1="106" y1="40" x2="160" y2="40" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
          <line x1="106" y1="52" x2="174" y2="52" stroke="#64748b" strokeWidth="2" />
          <line x1="106" y1="62" x2="150" y2="62" stroke="#64748b" strokeWidth="2" />
          <line x1="106" y1="72" x2="168" y2="72" stroke="#64748b" strokeWidth="2" />
          {/* Red Scam Stamp */}
          <rect x="114" y="78" width="56" height="22" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" transform="rotate(-6 142 89)" />
          <text x="142" y="93" fill="#fecaca" fontSize="9" fontWeight="900" textAnchor="middle" transform="rotate(-6 142 89)">
            FEE TRAP ✕
          </text>
          {/* Magnifying Glass Verifier */}
          <circle cx="186" cy="62" r="18" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" strokeWidth="2" />
          <line x1="198" y1="76" x2="216" y2="94" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    },
    phishing: {
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(168, 85, 247, 0.14) 100%)',
      borderColor: 'rgba(248, 113, 113, 0.35)',
      badge: 'PHISHING & CREDENTIAL DEFENSE',
      accentColor: '#f87171',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Deceptive Email Envelope */}
          <rect x="75" y="32" width="130" height="78" rx="10" fill="rgba(15, 23, 42, 0.95)" stroke="#f87171" strokeWidth="1.5" />
          <path d="M78 36 L140 82 L202 36" stroke="#f87171" strokeWidth="1.5" />
          {/* Malicious Hook Interception */}
          <path d="M140 14 L140 48 C140 60, 126 60, 126 50" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
          {/* Shield Firewall Blocking Hook */}
          <polygon points="140,42 164,52 164,80 140,94 116,80 116,52" fill="rgba(15, 23, 42, 0.9)" stroke="#00ff88" strokeWidth="2" />
          <text x="140" y="72" fill="#00ff88" fontSize="9" fontWeight="900" textAnchor="middle">BLOCKED</text>
          {/* Spoofed Link Indicator */}
          <rect x="94" y="96" width="92" height="18" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
          <text x="140" y="108" fill="#fecaca" fontSize="7" fontWeight="800" textAnchor="middle">paypa1-fake.xyz ✕</text>
        </svg>
      ),
    },
    browsing: {
      gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(16, 185, 129, 0.14) 100%)',
      borderColor: 'rgba(56, 189, 248, 0.35)',
      badge: 'SAFE WEB BROWSING & HTTPS',
      accentColor: '#38bdf8',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Browser Window Frame */}
          <rect x="65" y="24" width="150" height="92" rx="10" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Browser Header Bar */}
          <rect x="65" y="24" width="150" height="24" rx="10" fill="rgba(56, 189, 248, 0.15)" />
          <circle cx="78" cy="36" r="3" fill="#ef4444" />
          <circle cx="88" cy="36" r="3" fill="#f59e0b" />
          <circle cx="98" cy="36" r="3" fill="#10b981" />
          {/* URL Search Pill */}
          <rect x="110" y="28" width="96" height="16" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
          <circle cx="118" cy="36" r="3" fill="#00ff88" />
          <text x="126" y="40" fill="#34d399" fontSize="7" fontWeight="700">https://verified.org</text>
          {/* Webpage Shield Centerpiece */}
          <polygon points="140,58 160,68 160,90 140,102 120,90 120,68" fill="rgba(16, 185, 129, 0.15)" stroke="#00ff88" strokeWidth="1.8" />
          <path d="M133 80 L138 85 L148 74" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    social: {
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.14) 100%)',
      borderColor: 'rgba(192, 132, 252, 0.35)',
      badge: 'SOCIAL MEDIA PRIVACY ARMOR',
      accentColor: '#c084fc',
      svg: (
        <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="topic-svg">
          {/* Social Network Nodes */}
          <line x1="85" y1="70" x2="140" y2="70" stroke="rgba(192, 132, 252, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="140" y1="70" x2="195" y2="70" stroke="rgba(192, 132, 252, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Center Protected Profile */}
          <circle cx="140" cy="70" r="32" fill="rgba(15, 23, 42, 0.95)" stroke="#c084fc" strokeWidth="2" />
          <circle cx="140" cy="62" r="10" fill="rgba(192, 132, 252, 0.25)" stroke="#c084fc" strokeWidth="1.5" />
          <path d="M126 84 C126 76, 154 76, 154 84" fill="rgba(192, 132, 252, 0.25)" stroke="#c084fc" strokeWidth="1.5" />
          {/* 2FA Phone Shield Badge */}
          <rect x="65" y="55" width="36" height="30" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="1.2" />
          <text x="83" y="73" fill="#f472b6" fontSize="8" fontWeight="800" textAnchor="middle">2FA: ON</text>
          {/* Privacy Locked Badge */}
          <rect x="180" y="55" width="40" height="30" rx="6" fill="#0f172a" stroke="#00ff88" strokeWidth="1.2" />
          <text x="200" y="73" fill="#00ff88" fontSize="8" fontWeight="800" textAnchor="middle">PRIVATE</text>
        </svg>
      ),
    },
  }

  const v = visuals[topic] || visuals.privacy

  return (
    <div
      className="module-topic-visual-banner"
      style={{
        background: v.gradient,
        borderBottom: `1px solid ${v.borderColor}`,
        position: 'relative',
        width: '100%',
        height: '148px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      {/* Background ambient radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '160px',
          height: '100px',
          borderRadius: '50%',
          background: v.accentColor,
          filter: 'blur(45px)',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />

      {/* SVG Centerpiece Artwork */}
      {v.svg}

      {/* Topic Sub-Pill Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          fontSize: '9px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: v.accentColor,
          background: 'rgba(10, 15, 30, 0.85)',
          border: `1px solid ${v.borderColor}`,
          padding: '2px 8px',
          borderRadius: '99px',
          backdropFilter: 'blur(8px)',
          textTransform: 'uppercase',
        }}
      >
        {v.badge}
      </div>
    </div>
  )
}
