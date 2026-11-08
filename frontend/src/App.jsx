import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  EyeOff,
  Flame,
  Fingerprint,
  Globe,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  Menu,
  MousePointer2,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, listOf } from './api'
import { useAuth } from './AuthContext'
import CyberBackground from './components/CyberBackground'
import CyberShield3D from './components/CyberShield3D'
import CyberPadlock3D from './components/CyberPadlock3D'
import CyberTrophy3D from './components/CyberTrophy3D'
import CyberGlobe3D from './components/CyberGlobe3D'
import CyberScanner3D from './components/CyberScanner3D'

function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isAdminSection = location.pathname.startsWith('/admin')

  if (isAdminSection) {
    const adminLinks = [
      ['Overview', '/admin'],
      ['Modules', '/admin/modules'],
      ['Categories', '/admin/categories'],
      ['Students', '/admin/students'],
    ]
    return (
      <header className="topbar">
        <Link to="/admin" className="brand">
          <span className="brand-mark"><Shield size={20} /></span>
          <span>Digi<span className="brand-accent">Aware</span><small>ADMIN CONSOLE</small></span>
        </Link>
        <button className="mobile-toggle icon-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'main-nav nav-open' : 'main-nav'}>
          {adminLinks.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === '/admin'} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="button button-outline button-small" to="/dashboard">
            Learner view <ArrowRight size={14} />
          </Link>
          <button className="button button-quiet button-small" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
    )
  }

  const userLinks = [
    ['Home', '/'],
    ['Learn', '/learn'],
    ['Cyber safety', '/cyber-safety'],
    ['Leaderboard', '/leaderboard'],
  ]
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark"><Shield size={20} /></span>
        <span>Digi<span className="brand-accent">Aware</span><small>THINK BEFORE YOU CLICK</small></span>
      </Link>
      <button className="mobile-toggle icon-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'main-nav nav-open' : 'main-nav'}>
        {userLinks.map(([label, path]) => (
          <NavLink key={path} to={path} onClick={() => setOpen(false)}>
            {label}
          </NavLink>
        ))}
        {user && (
          <>
            {(user.is_staff || user.role === 'admin') ? (
              <>
                <NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>
                <NavLink to="/admin" onClick={() => setOpen(false)}>Admin Console</NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)}>Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)}>Profile</NavLink>
              </>
            )}
          </>
        )}
      </nav>
      <div className="header-actions">
        {user ? (
          <>
            <Link className="nav-user" to={user.is_staff ? "/admin" : "/dashboard"}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              {user.first_name || user.username}
            </Link>
            <button className="button button-quiet button-small" onClick={logout}>Sign out</button>
          </>
        ) : (
          <>
            <Link className="login-link" to="/login">Log in</Link>
            <Link className="button button-primary button-small" to="/register">Get started <ArrowUpRight size={15} /></Link>
          </>
        )}
      </div>
    </header>
  )
}

function Footer() {
  const location = useLocation()
  const isAdminSection = location.pathname.startsWith('/admin')

  if (isAdminSection) {
    return (
      <footer className="footer footer-admin">
        <div className="footer-bottom">
          <span>DigiAware Management Console · Staff Operations</span>
          <span><ShieldCheck size={14} /> Active Session Encrypted</span>
        </div>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="brand">
            <span className="brand-mark"><Shield size={20} /></span>
            <span>Digi<span className="brand-accent">Aware</span><small>THINK BEFORE YOU CLICK</small></span>
          </Link>
          <p style={{ marginTop: 14 }}>
            Better instincts. Safer internet.<br />
            Defending digital citizens with interactive 3D scenario training.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/learn">Explore missions</Link>
          <Link to="/cyber-safety">Safety guide</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/login">Learner portal</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 DigiAware. Built for a resilient, safer internet.</span>
        <span><ShieldCheck size={14} /> All Systems Operational · 256-Bit SSL</span>
      </div>
    </footer>
  )
}

function AppLayout({ children }) {
  return (
    <>
      <CyberBackground />
      <Header />
      {children}
      <Footer />
    </>
  )
}

function Home() {
  const [stats, setStats] = useState(null)
  const [featured, setFeatured] = useState([])
  const [statsError, setStatsError] = useState('')
  const [selectedThreat, setSelectedThreat] = useState('phishing')

  useEffect(() => {
    api('/overview/').then(setStats).catch((reason) => setStatsError(reason.message))
    api('/modules/').then((payload) => setFeatured(listOf(payload).slice(0, 3))).catch((reason) => setStatsError(reason.message))
  }, [])

  const threatVectors = [
    {
      id: 'phishing',
      title: 'Phishing & Impersonation',
      badge: 'HIGH FREQUENCY',
      description: 'Lookalike bank portals, fake IT password reset emails, and spoofed SMS claiming delivery failure.',
      clues: [
        'Deceptive sender domains (e.g., paypa1-auth.net or update-kyc-bank.xyz)',
        'Artificial urgency ("Your account will be suspended within 2 hours")',
        'Demands to input OTP or master passwords on unverified web forms',
      ],
      action: 'Always navigate directly to the verified URL or official mobile app.',
    },
    {
      id: 'upi',
      title: 'UPI & Payment Scams',
      badge: 'CRITICAL THREAT',
      description: 'Fraudulent QR codes sent via WhatsApp/OLX claiming "Scan to receive payment or cashback".',
      clues: [
        'Rule #1 of UPI: You NEVER need to enter your PIN or scan a QR to receive money',
        'Fraudulent collect requests disguised as refund authorizations',
        'Remote screen sharing app requests (AnyDesk, TeamViewer) during support calls',
      ],
      action: 'Decline unsolicited collect requests; never reveal UPI PIN for incoming funds.',
    },
    {
      id: 'social',
      title: 'Social Engineering & DMs',
      badge: 'COGNITIVE EXPLOIT',
      description: 'Compromised friend accounts asking for urgent loans, fake crypto opportunities, or job offers.',
      clues: [
        'Unusual tone or unexpected financial emergency from an acquaintance',
        'Work-from-home "YouTube video like" telegram tasks requesting deposit fees',
        'Links prompting you to re-login into Instagram or Facebook to vote for a friend',
      ],
      action: 'Verify with your friend over an offline phone call before transferring any funds.',
    },
    {
      id: 'identity',
      title: 'Identity & Data Leakage',
      badge: 'LONG-TERM RISK',
      description: 'Oversharing sensitive personal identifiers, unmasked Aadhaar/PAN cards, and unsecured Wi-Fi.',
      clues: [
        'Unprotected public Wi-Fi without VPN encryption in transit',
        'Unnecessary document collection by unvetted apps requesting camera and contacts access',
        'Sharing boarding passes or event tickets with readable barcodes online',
      ],
      action: 'Use masked documents and review app permissions in your phone settings.',
    },
  ]

  const whyFeatures = [
    {
      icon: Zap,
      title: 'Zero Boring Lectures',
      description: 'Forget 40-minute compliance videos. DigiAware uses micro-simulations based on actual fraud telemetry that takes less than 3 minutes to master.',
    },
    {
      icon: Eye,
      title: 'Cognitive Reflex Training',
      description: 'We train your instinct to pause and detect red flags—psychological manipulation, domain spoofs, and fake urgency—in real-time digital moments.',
    },
    {
      icon: Award,
      title: 'Verified Cyber Credentialing',
      description: 'Earn points, unlock achievement badges, rank on the cohort leaderboard, and earn an authenticated Cyber Safety Certificate of Completion.',
    },
  ]

  const roadmapSteps = [
    { num: '01', title: 'Baseline Diagnostic', text: 'Measure your initial security reflexes against current fraud vectors.' },
    { num: '02', title: 'Phishing Decryption', text: 'Identify spoofed domains, masked links, and urgent call-to-action traps.' },
    { num: '03', title: 'Payment Vault Armor', text: 'Master safe UPI habits, payment gateway checks, and banking security.' },
    { num: '04', title: 'Identity Hardening', text: 'Lock down social accounts, MFA configurations, and privacy permissions.' },
    { num: '05', title: 'Certified Defender', text: 'Complete all mission modules to earn your authenticated certificate.' },
  ]

  return (
    <AppLayout>
      <main className="home-page">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse-dot" /> THINK BEFORE YOU CLICK · CYBER DEFENSE PROTOCOL
            </div>
            <h1>
              Your digital world.<br />
              <span>Your responsibility.</span>
            </h1>
            <p className="hero-subtitle">
              Think you can spot a scam? Prove it. Take quick, real-world missions that make you sharper, safer, and harder to fool online.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/learn">
                Play your first mission <ArrowRight size={17} />
              </Link>
              <Link className="button button-outline" to="/cyber-safety">
                Get the safety cheat sheet <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span><ShieldCheck size={15} /></span>
                <span><Eye size={14} /></span>
                <span><LockKeyhole size={13} /></span>
              </div>
              <div>
                <strong>Real scenarios. Actual street smarts.</strong>
                <p>Interactive 3D simulations. Skills that stick when it counts.</p>
              </div>
            </div>
          </div>

          {/* 3D CYBER SHIELD HERO VISUAL */}
          <motion.div
            className="hero-3d-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-3d-canvas-wrapper">
              <CyberShield3D />
            </div>
            <div className="mission-stamp">
              <Sparkles size={14} /> DIGITAL STREET SMARTS
            </div>
            <div className="float-card float-top">
              <span className="float-icon float-blue"><Fingerprint size={17} /></span>
              <span><b>Identity Shielding</b><small>Active defense enabled</small></span>
              <Check className="float-check" size={15} />
            </div>
            <div className="float-card float-bottom">
              <span className="float-icon float-purple"><Eye size={17} /></span>
              <span><b>Catch Red Flags</b><small>Before you tap or enter OTP</small></span>
            </div>
          </motion.div>

          <div className="hero-scroll">
            <ArrowDown size={15} /> SCROLL FOR DEFENSE INTELLIGENCE
          </div>
        </section>

        {/* TOPIC TICKER */}
        <div className="topic-ticker" aria-label="Explore digital safety topics">
          <div className="ticker-track">
            <span>PHISHING DEFENSE</span><Sparkles size={15} />
            <span>UPI PAYMENT SCAMS</span><Sparkles size={15} />
            <span>IDENTITY HARDENING</span><Sparkles size={15} />
            <span>FAKE RECRUITMENT</span><Sparkles size={15} />
            <span>TWO-FACTOR AUTHENTICATION</span><Sparkles size={15} />
            <span>PHISHING DEFENSE</span><Sparkles size={15} />
            <span>UPI PAYMENT SCAMS</span><Sparkles size={15} />
            <span>IDENTITY HARDENING</span><Sparkles size={15} />
            <span>FAKE RECRUITMENT</span><Sparkles size={15} />
            <span>TWO-FACTOR AUTHENTICATION</span><Sparkles size={15} />
          </div>
        </div>

        {/* STATS STRIP */}
        <section className="stats-strip">
          <div>
            <strong>{stats ? String(stats.modules).padStart(2, '0') : '—'}<span>+</span></strong>
            <p>Published learning paths</p>
          </div>
          <div>
            <strong>{stats ? String(stats.knowledge_checks).padStart(2, '0') : '—'}<span>+</span></strong>
            <p>Practical knowledge checks</p>
          </div>
          <div>
            <strong>{stats ? stats.points_per_lesson : '—'}<span> pts</span></strong>
            <p>For each cleared mission</p>
          </div>
          <div className="stats-cta">
            Every mission gives you a new skill.<br />
            Every skill makes you harder to fool. <ArrowRight size={16} />
          </div>
          {statsError && <p className="error-message" role="status">{statsError}</p>}
        </section>

        {/* FEATURED MODULES */}
        <section className="section modules-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PICK YOUR FIRST MISSION</span>
              <h2>Real-world smarts.<br /><span>No boring lectures.</span></h2>
            </div>
            <Link className="text-link" to="/learn">Browse all missions <ArrowRight size={16} /></Link>
          </div>
          <div className="module-grid">
            {featured.map((item, index) => (
              <ModuleCard item={item} index={index} key={item.title} />
            ))}
          </div>
        </section>

        {/* INTERACTIVE CYBER THREAT RADAR */}
        <section className="section" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow"><Radio size={14} /> LIVE THREAT INTELLIGENCE</span>
              <h2>Interactive threat radar.<br /><span>Know what to look for.</span></h2>
            </div>
            <Link className="text-link" to="/cyber-safety">Explore safety handbook <ArrowRight size={16} /></Link>
          </div>
          <div className="radar-grid">
            {threatVectors.map((threat) => {
              const isActive = selectedThreat === threat.id
              return (
                <div
                  key={threat.id}
                  className={`radar-card ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedThreat(threat.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isActive}
                >
                  <span className="radar-badge">{threat.badge}</span>
                  <h3>{threat.title}</h3>
                  <p>{threat.description}</p>
                  <span className="radar-pill">
                    {isActive ? 'Threat Red Flags Exposed' : 'Tap to inspect red flags'} <ChevronRight size={14} />
                  </span>
                  {isActive && (
                    <div className="radar-warning-signs">
                      {threat.clues.map((clue, idx) => (
                        <div className="radar-warning-item" key={idx}>
                          <ShieldAlert size={14} />
                          <span>{clue}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--highlight)', fontWeight: 600 }}>
                        Safer move: {threat.action}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* WHY DIGIAWARE */}
        <section className="section" style={{ maxWidth: 1280, margin: '80px auto 0', padding: '0 24px' }}>
          <div className="section-heading" style={{ textAlign: 'center', justifyContent: 'center' }}>
            <div>
              <span className="eyebrow">ENGINEERED FOR INSTINCTS</span>
              <h2>Why DigiAware works.</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 560, margin: '12px auto 0' }}>
                We replaced passive slide decks with active scenario simulations that build authentic cyber reflexes.
              </p>
            </div>
          </div>
          <div className="why-grid">
            {whyFeatures.map((f, i) => {
              const Icon = f.icon
              return (
                <div className="why-card" key={i}>
                  <div className="why-icon"><Icon size={24} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* LEARNING ROADMAP JOURNEY (Clear, Readable Font Sizes) */}
        <section className="section" style={{ maxWidth: 1280, margin: '80px auto 0', padding: '0 24px' }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">STRUCTURED CURRICULUM</span>
              <h2>Your learning roadmap.<br /><span>From novice to defender.</span></h2>
            </div>
          </div>
          <div className="journey-strip">
            {roadmapSteps.map((step) => (
              <div className="journey-step" key={step.num}>
                <span className="journey-step-num">PHASE {step.num}</span>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3D MANIFESTO & GLOBAL DEFENSE NETWORK */}
        <section className="manifesto">
          <div className="manifesto-copy">
            <div className="manifesto-stamp">
              <ShieldCheck size={20} />
              <span>THE AWARE WAY · GLOBAL DEFENSE</span>
            </div>
            <span className="eyebrow">A SAFER INTERNET IS A SHARED RESPONSIBILITY</span>
            <h2>
              Smart isn't never making a mistake.<br />
              It's <span>knowing better.</span>
            </h2>
            <p>
              No scare tactics. No technical jargon. Just actionable cyber instincts and cognitive reflexes built one real-life scenario at a time.
            </p>
            <p>
              Our interactive defense network trains your muscle memory so that you automatically spot pressure tactics, fake domains, and rogue requests before you click.
            </p>
            <div style={{ marginTop: 10 }}>
              <Link className="button button-outline" to="/cyber-safety">
                Explore Defensive Playbook <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* INTERACTIVE 3D ROTATING CYBER GLOBE */}
          <div className="manifesto-3d-visual">
            <CyberGlobe3D height={380} />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div className="cta-light" />
          <span className="eyebrow">READY TO TRUST YOUR INSTINCTS?</span>
          <h2>Make your next click<br /><span>your smartest one yet.</span></h2>
          <p>Choose a mission, test your instincts, and earn points toward your verified DigiAware certificate.</p>
          <Link className="button button-primary" to="/register">
            Start your streak <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </AppLayout>
  )
}

function ModuleCard({ item, index }) {
  const icons = [MousePointer2, Eye, ShieldCheck]
  const colors = ['blue', 'purple', 'green']
  const Icon = icons[index % icons.length]
  return (
    <Link className={`module-card card-${colors[index % colors.length]}`} to={`/learn/${item.slug}`}>
      <div className="module-card-top">
        <span className="module-icon"><Icon size={20} /></span>
        <span className="module-arrow"><ArrowUpRight size={17} /></span>
      </div>
      <span className="module-category">{item.category_name?.toUpperCase() || 'DIGITAL SAFETY'}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="module-meta">
        <span><Clock3 size={14} /> {item.estimated_minutes} min</span>
        <span>PATH {String(index + 1).padStart(2, '0')}</span>
      </div>
    </Link>
  )
}

function AuthPage({ register = false, resetRequest = false, resetCredentials = false }) {
  const { login, register: signUp, authError } = useAuth()
  const { uid, token } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState(authError)
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (resetRequest) {
        const response = await api('/auth/password-reset/', { method: 'POST', body: JSON.stringify(data) })
        setNotice(response.detail)
      } else if (resetCredentials) {
        const response = await api(`/auth/password-reset/${uid}/${token}/`, { method: 'POST', body: JSON.stringify(data) })
        setNotice(response.detail)
        navigate('/login', { state: { notice: response.detail } })
      } else {
        if (register) {
          await signUp(data)
          navigate('/dashboard')
        } else {
          const loggedInUser = await login(data.username, data.password)
          navigate(loggedInUser?.is_staff ? '/admin' : '/dashboard')
        }
      }
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }

  const heading = resetRequest
    ? 'Reset your password.'
    : resetCredentials
    ? 'Choose a new password.'
    : register
    ? 'Join the aware.'
    : 'Welcome back.'
  const eyebrow = resetRequest || resetCredentials
    ? 'ACCOUNT RECOVERY'
    : register
    ? 'YOUR SAFER INTERNET STARTS HERE'
    : 'AUTHENTICATED GATEWAY'

  return (
    <AppLayout>
      <main className="auth-page">
        <div className="auth-panel">
          <div className="auth-vault-banner">
            <CyberPadlock3D height={180} />
          </div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{heading}</h1>
          <p>
            {resetRequest
              ? 'We’ll email a secure reset link if an account matches.'
              : resetCredentials
              ? 'Choose a new password to get back to learning.'
              : register
              ? 'Build better digital instincts, one lesson at a time.'
              : 'Your next smart move is waiting.'}
          </p>
          <form className="auth-form" onSubmit={submit}>
            {resetRequest ? (
              <label>
                Email address
                <input name="email" type="email" placeholder="you@college.edu" required />
              </label>
            ) : resetCredentials ? (
              <label>
                New password
                <div className="password-input-wrap">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            ) : (
              <>
                {register && (
                  <>
                    <label>
                      First name
                      <input name="first_name" placeholder="How should we call you?" required maxLength={150} />
                    </label>
                    <label>
                      Last name
                      <input name="last_name" placeholder="Your last name" maxLength={150} />
                    </label>
                  </>
                )}
                <label>
                  Username
                  <input name="username" placeholder="Your username" autoComplete="username" required minLength={3} maxLength={150} />
                </label>
                {register && (
                  <>
                    <label>
                      Email address
                      <input name="email" type="email" placeholder="you@college.edu" required />
                    </label>
                    <label>
                      College (optional)
                      <input name="college" placeholder="Your college or university" maxLength={160} />
                    </label>
                  </>
                )}
                <label>
                  Password
                  <div className="password-input-wrap">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      autoComplete={register ? 'new-password' : 'current-password'}
                      required
                      minLength={register ? 8 : 1}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </>
            )}

            {error && <div className="error-message" role="alert">{error}</div>}
            {notice && <div className="success-message" role="status">{notice}</div>}

            <button className="button button-primary auth-submit" disabled={busy}>
              {busy ? 'Verifying session…' : resetRequest ? 'Send reset link' : resetCredentials ? 'Update password' : register ? 'Create my account' : 'Log in'} <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            {resetRequest || resetCredentials ? (
              <Link to="/login">Back to log in</Link>
            ) : register ? (
              <>Already learning with us? <Link to="/login">Log in</Link></>
            ) : (
              <>New to DigiAware? <Link to="/register">Create an account</Link></>
            )}
          </p>
          {!register && !resetRequest && !resetCredentials && (
            <p className="auth-switch">
              <Link to="/forgot-password">Forgot your password?</Link>
            </p>
          )}
        </div>
        <div className="auth-note">
          <ShieldCheck size={16} /> 256-Bit Encrypted Session · Safe & Private Credentials
        </div>
      </main>
    </AppLayout>
  )
}

function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth()
  if (loading) return <AppLayout><div className="loading-state">Authenticating secure session…</div></AppLayout>
  if (!user) return <Navigate to="/login" replace />
  if (admin && !user.is_staff && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/dashboard/').then(setData).catch((reason) => setError(reason.message))
  }, [])

  if (error) return <AppLayout><div className="loading-state error-message">{error}</div></AppLayout>
  if (!data) return <AppLayout><div className="loading-state">Loading your learning snapshot…</div></AppLayout>

  const chartData = data.activity.map((item) => ({
    day: new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
    points: item.points,
  }))

  return (
    <AppLayout>
      <main className="app-page">
        <div className="dashboard-welcome">
          <div>
            <div className="eyebrow">
              <span className="pulse-dot" /> DEFENDER COMMAND CENTER
            </div>
            <h1>Good to see you, <span>{user.first_name || user.username}.</span></h1>
            <p>One smart step at a time. Here's your current digital defense profile.</p>
          </div>
          <Link className="button button-primary" to="/learn">
            Continue learning <ArrowRight size={16} />
          </Link>
        </div>

        {/* 5 TELEMETRY METRICS */}
        <div className="dashboard-stats">
          <Stat icon={Target} label="Awareness points" value={data.points} note={`Level ${data.level}`} color="blue" />
          <Stat icon={BookOpen} label="Lessons completed" value={data.completed_lessons} note={`${data.total_lessons} in your library`} color="purple" />
          <Stat icon={Flame} label="Learning streak" value={`${data.streak} ${data.streak === 1 ? 'day' : 'days'}`} note="Keep your momentum" color="orange" />
          <Stat icon={Award} label="Badges earned" value={data.achievements.length} note="Every step counts" color="green" />
          <Stat icon={Users} label="Leaderboard position" value={data.leaderboard_position ? `#${data.leaderboard_position}` : '—'} note={data.leaderboard_position ? 'Among active learners' : 'Earn points to be ranked'} color="blue" />
        </div>

        {data.certificate_earned && (
          <Link className="button button-outline certificate-link" to="/certificate" style={{ marginBottom: 24 }}>
            <Award size={16} /> View your Cyber Safety certificate <ArrowUpRight size={15} />
          </Link>
        )}

        <div className="dashboard-columns">
          {/* AREA CHART */}
          <section className="dash-card progress-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">YOUR MOMENTUM</span>
                <h2>Awareness over time</h2>
              </div>
              <span className="chart-label"><span /> POINTS EARNED</span>
            </div>
            <div className="chart-container">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0d1426', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 12, color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="points" stroke="#38bdf8" strokeWidth={2.5} fill="url(#chartFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">Finish your first lesson to see your progress here.</div>
              )}
            </div>
            <Link to="/learn" className="text-link">Pick up where you left off <ArrowRight size={15} /></Link>
          </section>

          {/* 3D TROPHY CASE */}
          <section className="dash-card">
            <div className="dash-card-head">
              <div>
                <span className="eyebrow">IN YOUR TROPHY CASE</span>
                <h2>Recent badges</h2>
              </div>
              <Award className="muted-icon" />
            </div>
            <div className="dashboard-trophy-display">
              <CyberTrophy3D height={150} />
            </div>
            <div className="badge-list">
              {data.achievements.length ? (
                data.achievements.slice(0, 3).map((badge) => (
                  <div className="badge-item" key={badge.id}>
                    <span className="badge-icon"><ShieldCheck size={17} /></span>
                    <span><b>{badge.name}</b><small>{badge.description}</small></span>
                    <Check size={15} className="badge-check" />
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  Your first badge is one completed lesson away. <Link to="/learn">Find a lesson <ArrowRight size={14} /></Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="dash-card recent-activity">
          <div className="dash-card-head">
            <div>
              <span className="eyebrow">YOUR LATEST STEPS</span>
              <h2>Recent activity</h2>
            </div>
            <Activity className="muted-icon" />
          </div>
          {data.recent_activity.length ? (
            data.recent_activity.map((activity) => (
              <div className="activity-row" key={activity.id}>
                <span className="activity-dot" />
                <span>{activity.description}</span>
                <small>{new Date(activity.created_at).toLocaleDateString()}</small>
                <b>+{activity.points} pts</b>
              </div>
            ))
          ) : (
            <div className="empty-state">
              Your activity appears here after your first lesson. <Link to="/learn">Explore lessons <ArrowRight size={14} /></Link>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}

function Stat({ icon: Icon, label, value, note, color }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${color}`}><Icon size={19} /></span>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

function Learn() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')

  useEffect(() => {
    api('/modules/')
      .then((payload) => setItems(listOf(payload)))
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const set = new Set(['ALL'])
    items.forEach((item) => {
      const name = item.category_name || item.category?.name
      if (name) set.add(name.toUpperCase())
    })
    return Array.from(set)
  }, [items])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') return items
    return items.filter((item) => {
      const name = (item.category_name || item.category?.name || '').toUpperCase()
      return name === activeCategory
    })
  }, [items, activeCategory])

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow"><Target size={14} /> FIELD TRAINING REPERTORY</span>
          <h1>Real-life skills.<br /><span>Real-world ready.</span></h1>
          <p>Short, hands-on learning paths that train your cognitive reflexes against deceptive attacks.</p>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="learning-filters" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? 'filter-active' : ''}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2))' : 'rgba(17, 27, 48, 0.6)',
                border: activeCategory === cat ? '1px solid var(--highlight)' : '1px solid var(--border-subtle)',
                color: activeCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat === 'ALL' ? <><Sparkles size={13} style={{ display: 'inline', marginRight: 5 }} /> ALL MISSIONS</> : cat}
            </button>
          ))}
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : loading ? (
          <div className="loading-state">Loading learning paths…</div>
        ) : filteredItems.length ? (
          <div className="module-grid">
            {filteredItems.map((item, index) => (
              <Link className={`module-card card-${['blue', 'purple', 'green'][index % 3]}`} to={`/learn/${item.slug}`} key={item.id}>
                <div className="module-card-top">
                  <span className="module-icon"><BookOpen size={20} /></span>
                  <span className="module-arrow"><ArrowUpRight size={17} /></span>
                </div>
                <span className="module-category">{item.category_name || item.category?.name || 'DIGITAL SAFETY'}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="module-meta">
                  <span><Clock3 size={14} /> {item.lessons?.length || 'Interactive'} lesson</span>
                  <span>{item.difficulty?.toUpperCase() || 'ALL LEVELS'}</span>
                </div>
                <div className="module-progress">
                  <span style={{ width: `${Math.min(92, 28 + index * 21)}%` }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">No missions found in this category. Check back soon.</div>
        )}
      </main>
    </AppLayout>
  )
}

function CyberSafety() {
  const topics = [
    {
      icon: Eye,
      name: 'Phishing & Suspicious Messages',
      description: 'Spot lookalike domains, fake SMS notifications, and urgency bait before you tap or provide credentials.',
      tips: [
        'Examine sender headers for mismatched subdomains (e.g. support@netflix-update-billing.com).',
        'Legitimate companies never ask you to re-verify full credentials over SMS or WhatsApp.',
        'Hover or long-press links to inspect true destinations before tapping.',
      ],
    },
    {
      icon: ShieldCheck,
      name: 'Payments & UPI Protection',
      description: 'Key habits to keep your bank account and digital payments safe from QR traps and collect fraud.',
      tips: [
        'Entering your UPI PIN always DEDUCTS money from your account; you never enter PIN to receive funds.',
        'Never scan an unknown QR code sent by a buyer or seller on classified portals.',
        'Set daily transaction limits in your banking app for an extra layer of defense.',
      ],
    },
    {
      icon: Fingerprint,
      name: 'Privacy & Identity Hardening',
      description: 'Control who accesses your personal data, masked identity cards, and mobile permissions.',
      tips: [
        'Download and share only Masked Aadhaar cards showing only the last 4 digits.',
        'Audit smartphone permissions: revoke location and contact access for flashlight and calculator apps.',
        'Turn on Multi-Factor Authentication (MFA) via authenticator apps rather than plain SMS.',
      ],
    },
    {
      icon: Users,
      name: 'Social Media & Account Takeover',
      description: 'Defend against session hijacking, fake friend urgent emergencies, and impersonation accounts.',
      tips: [
        'If a close friend or colleague urgently requests money on Instagram/WhatsApp, call them offline first.',
        'Do not click "Vote for my friend in an ambassador contest" links that demand social logins.',
        'Log out of active sessions periodically from your account security dashboard.',
      ],
    },
  ]

  return (
    <AppLayout>
      <main className="app-page">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(240px, 1fr)', gap: 30, alignItems: 'center', marginBottom: 40 }}>
          <div className="page-intro" style={{ marginBottom: 0 }}>
            <span className="eyebrow"><Shield size={14} /> DEFENSIVE PLAYBOOK</span>
            <h1>Know the signs.<br /><span>Trust your instincts.</span></h1>
            <p>Practical rules of thumb for everyday digital moments. No scare tactics, just straightforward defense.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CyberPadlock3D height={200} />
          </div>
        </div>

        <div className="safety-grid">
          {topics.map(({ icon: Icon, name, description, tips }, index) => (
            <div className="safety-card" key={name}>
              <span className={`safety-number number-${index}`}>0{index + 1}</span>
              <span className="safety-icon"><Icon size={21} /></span>
              <h3>{name}</h3>
              <p>{description}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 20px', display: 'grid', gap: 8 }}>
                {tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#CBD5E1', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Check size={14} style={{ color: 'var(--highlight)', flexShrink: 0, marginTop: 2 }} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <Link to="/learn" className="text-link">Explore related missions <ArrowRight size={14} /></Link>
            </div>
          ))}
        </div>

        <div className="safety-note">
          <CircleHelp size={24} style={{ color: 'var(--highlight)' }} />
          <div>
            <b>Something doesn't feel right?</b>
            <p>
              Pause. Don't click. Don't approve. Ask someone you trust. If financial details or passwords have been compromised, immediately report the incident via the National Cyber Crime Reporting Portal (1930 in India) or contact your banking institution through their official verified app.
            </p>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}

function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/leaderboard/').then((payload) => setEntries(listOf(payload))).catch((reason) => setError(reason.message))
  }, [])

  const topThree = entries.slice(0, 3)

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow"><Award size={14} /> COHORT DEFENDER STANDINGS</span>
          <h1>Good instincts.<br /><span>Great company.</span></h1>
          <p>Every point on this board was earned by identifying real threats and mastering cyber missions.</p>
        </div>

        {/* TOP 3 PODIUM */}
        {topThree.length >= 2 && (
          <div className="podium-container">
            {/* RANK 2 - SILVER */}
            {topThree[1] && (
              <div className="podium-card podium-silver">
                <div className="podium-rank-badge">RANK 02</div>
                <div className="podium-avatar">
                  {(topThree[1].first_name || 'L').slice(0, 1).toUpperCase()}
                </div>
                <h3>{topThree[1].first_name || 'Learner'}</h3>
                <p>{topThree[1].completed_lessons} missions cleared</p>
                <div className="podium-score"><b>{topThree[1].points}</b> XP</div>
              </div>
            )}

            {/* RANK 1 - GOLD */}
            {topThree[0] && (
              <div className="podium-card podium-gold">
                <div className="podium-crown"><Award size={24} /></div>
                <div className="podium-rank-badge">CHAMPION 01</div>
                <div className="podium-avatar" style={{ width: 62, height: 62, fontSize: 22, borderColor: '#f59e0b' }}>
                  {(topThree[0].first_name || 'L').slice(0, 1).toUpperCase()}
                </div>
                <h3>{topThree[0].first_name || 'Learner'}</h3>
                <p>{topThree[0].completed_lessons} missions cleared</p>
                <div className="podium-score" style={{ color: '#f59e0b', fontSize: 22 }}>
                  <b>{topThree[0].points}</b> XP
                </div>
              </div>
            )}

            {/* RANK 3 - BRONZE */}
            {topThree[2] && (
              <div className="podium-card podium-bronze">
                <div className="podium-rank-badge">RANK 03</div>
                <div className="podium-avatar">
                  {(topThree[2].first_name || 'L').slice(0, 1).toUpperCase()}
                </div>
                <h3>{topThree[2].first_name || 'Learner'}</h3>
                <p>{topThree[2].completed_lessons} missions cleared</p>
                <div className="podium-score"><b>{topThree[2].points}</b> XP</div>
              </div>
            )}
          </div>
        )}

        {/* FULL COHORT TABLE */}
        <section className="leaderboard-card">
          <div className="leader-head">
            <span>RANK</span>
            <span>LEARNER</span>
            <span>MISSIONS</span>
            <span>TOTAL POINTS</span>
          </div>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            entries.map((entry, index) => {
              const name = entry.first_name || 'Learner'
              return (
                <div className="leader-row" key={`${name}-${index}`}>
                  <b className={index < 3 ? `rank rank-${index}` : 'rank'}>
                    {String(index + 1).padStart(2, '0')}
                  </b>
                  <span className="leader-name">
                    <span className="leader-avatar">{name.slice(0, 1).toUpperCase()}</span>
                    <b>{name}</b>
                  </span>
                  <span>{entry.completed_lessons}</span>
                  <b>{entry.points} <small>pts</small></b>
                </div>
              )
            })
          )}
          {!error && entries.length === 0 && (
            <div className="empty-state">Your cohort's earned points will appear here.</div>
          )}
        </section>

        <p className="privacy-caption">
          <LockKeyhole size={14} /> Only first names and earned awareness points are shown to protect privacy.
        </p>
      </main>
    </AppLayout>
  )
}

function Profile() {
  const { user, updateProfile } = useAuth()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function saveProfile(event) {
    event.preventDefault()
    setError(''); setNotice('')
    try {
      await updateProfile(Object.fromEntries(new FormData(event.currentTarget)))
      setNotice('Your operative profile has been updated.')
    } catch (reason) { setError(reason.message) }
  }

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow"><Fingerprint size={14} /> OPERATIVE DOSSIER</span>
          <h1>Your digital identity.<br /><span>Your profile.</span></h1>
        </div>

        <section className="profile-card">
          <span className="profile-avatar">
            {(user.first_name || user.username).slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2>{user.first_name} {user.last_name}</h2>
            <p>@{user.username}</p>
            <span className="profile-role">
              {user.is_staff ? 'PLATFORM SECURITY ADMIN' : 'VERIFIED DIGIAWARE DEFENDER'}
            </span>
          </div>
        </section>

        <form className="auth-form profile-form" onSubmit={saveProfile}>
          <label>
            First name
            <input name="first_name" defaultValue={user.first_name} required maxLength={150} />
          </label>
          <label>
            Last name
            <input name="last_name" defaultValue={user.last_name} maxLength={150} />
          </label>
          <label>
            Email address
            <input name="email" type="email" defaultValue={user.email} required />
          </label>
          <label>
            College / Institution
            <input name="college" defaultValue={user.college || ''} maxLength={160} />
          </label>
          {error && <div className="error-message">{error}</div>}
          {notice && <div className="success-message">{notice}</div>}
          <button className="button button-primary">
            Save operative profile <Check size={16} />
          </button>
        </form>

        <div style={{ marginTop: 24 }}>
          <Link className="button button-outline" to="/dashboard">
            Back to dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </AppLayout>
  )
}

function Certificate() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/dashboard/').then(setData).catch((reason) => setError(reason.message))
  }, [])

  if (error) return <AppLayout><main className="app-page"><div className="error-message">{error}</div></main></AppLayout>
  if (!data) return <AppLayout><div className="loading-state">Verifying certificate credentials…</div></AppLayout>
  if (!data.certificate_earned) {
    return (
      <AppLayout>
        <main className="app-page">
          <div className="page-intro">
            <span className="eyebrow">MILESTONE PROGRESSION</span>
            <h1>Your certificate is <span>in reach.</span></h1>
            <p>Complete every published learning module to unlock your authenticated DigiAware certificate.</p>
          </div>
          <div className="dash-card">
            <b>{data.completed_lessons} of {data.total_lessons} lessons completed</b>
            <div className="module-progress">
              <span style={{ width: `${data.total_lessons ? Math.min(100, (data.completed_lessons / data.total_lessons) * 100) : 0}%` }} />
            </div>
            <div style={{ marginTop: 24 }}>
              <Link className="button button-primary" to="/learn">Continue learning <ArrowRight size={16} /></Link>
            </div>
          </div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="app-page certificate-page">
        <div className="certificate-actions">
          <span className="eyebrow">AUTHENTICATED CREDENTIAL</span>
          <button className="button button-primary" onClick={() => window.print()}>
            Print or save as PDF <ArrowUpRight size={16} />
          </button>
        </div>
        <article className="certificate">
          <span className="certificate-brand"><ShieldCheck size={25} /> DIGIAWARE</span>
          <span className="eyebrow">CERTIFICATE OF MASTERY</span>
          <h1>Digital awareness.<br /><span>Practiced with purpose.</span></h1>
          <p className="certificate-presented">This certifies that</p>
          <h2>{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</h2>
          <p>
            has successfully completed all {data.total_lessons} DigiAware cyber security missions, demonstrating rigorous instinctual defenses against deceptive and malicious threats online.
          </p>
          <div className="certificate-footer">
            <span><b>ISSUED</b><small>{new Date(data.certificate_issued_at).toLocaleDateString()}</small></span>
            <span className="certificate-seal"><ShieldCheck size={27} /><small>DIGIAWARE<br />VERIFIED</small></span>
            <span><b>TRACK</b><small>Cyber Safety</small></span>
          </div>
        </article>
        <p className="privacy-caption">
          This credential is cryptographically anchored to lesson completions recorded in your DigiAware account.
        </p>
      </main>
    </AppLayout>
  )
}

function Admin() {
  const [data, setData] = useState(null)
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/admin/analytics/'), api('/admin/students/')])
      .then(([analytics, learnerRows]) => {
        setData(analytics)
        setStudents(listOf(learnerRows))
      })
      .catch((reason) => setError(reason.message))
  }, [])

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow"><Shield size={14} /> PLATFORM TELEMETRY & OPERATIONS</span>
          <h1>Admin <span>overview.</span></h1>
          <p>Monitor platform-wide learning metrics, curriculum progress, and learner accounts.</p>
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : data ? (
          <>
            <div className="dashboard-stats admin-overview-stats">
              <Stat icon={Users} label="All learners" value={data.students} note={`${data.active_students} active`} color="blue" />
              <Stat icon={Activity} label="Inactive accounts" value={data.inactive_students} note="Can be reactivated" color="orange" />
              <Stat icon={BookOpen} label="Published modules" value={data.modules} note={`${data.lessons} total lessons`} color="purple" />
              <Stat icon={Check} label="Lessons completed" value={data.completions} note="Across all learners" color="green" />
              <Stat icon={Zap} label="Points awarded" value={data.points_awarded} note="From learning activity" color="blue" />
            </div>

            <section className="dash-card admin-progress-card">
              <div className="dash-card-head">
                <div>
                  <span className="eyebrow">CURRICULUM ENGAGEMENT</span>
                  <h2>Completions by learning path</h2>
                </div>
                <BookOpen className="muted-icon" />
              </div>
              {data.module_progress.length ? (
                <div className="admin-module-progress">
                  {data.module_progress.map((module) => (
                    <div className="admin-progress-row" key={module.lesson__module__title}>
                      <span>{module.lesson__module__title}</span>
                      <div className="module-progress">
                        <span style={{ width: `${data.completions ? Math.max(5, (module.completions / data.completions) * 100) : 0}%` }} />
                      </div>
                      <b>{module.completions}</b>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No lesson completions recorded yet.</p>
              )}
            </section>

            <section className="dash-card admin-learners">
              <div className="dash-card-head">
                <div>
                  <span className="eyebrow">ALL LEARNERS</span>
                  <h2>Progress at a glance</h2>
                </div>
                <Link className="text-link" to="/admin/students">Manage accounts <ArrowRight size={15} /></Link>
              </div>
              <div className="admin-roster-wrap">
                <div className="admin-roster admin-roster-head">
                  <span>LEARNER</span>
                  <span>STATUS</span>
                  <span>LESSONS</span>
                  <span>POINTS</span>
                  <span>STREAK</span>
                  <span>LAST ACTIVE</span>
                </div>
                {students.map((student) => (
                  <div className="admin-roster" key={student.id}>
                    <span className="admin-learner-name">
                      <b>{[student.first_name, student.last_name].filter(Boolean).join(' ') || student.username}</b>
                      <small>@{student.username} · {student.email}</small>
                    </span>
                    <span>
                      <i className={student.is_active ? 'status-dot status-active' : 'status-dot'} />
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span>{student.completed_lessons}</span>
                    <b>{student.points}</b>
                    <span>{student.learning_streak} days</span>
                    <span>{student.last_activity_date ? new Date(`${student.last_activity_date}T00:00:00`).toLocaleDateString() : '—'}</span>
                  </div>
                ))}
                {students.length === 0 && <p className="empty-state">No learner accounts yet.</p>}
              </div>
            </section>

            <div className="admin-links">
              <Link className="dash-card" to="/admin/modules">
                <BookOpen />
                <b>Manage learning modules</b>
                <span>Create, update and publish content <ArrowRight size={16} /></span>
              </Link>
              <Link className="dash-card" to="/admin/categories">
                <BookOpen />
                <b>Manage categories</b>
                <span>Organize learning content <ArrowRight size={16} /></span>
              </Link>
              <Link className="dash-card" to="/admin/students">
                <Users />
                <b>Manage students</b>
                <span>Review learner accounts <ArrowRight size={16} /></span>
              </Link>
            </div>
          </>
        ) : (
          <div className="loading-state">Loading platform analytics…</div>
        )}
      </main>
    </AppLayout>
  )
}

function AdminList() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/students/').then((payload) => setRows(listOf(payload))).catch((reason) => setError(reason.message))
  }, [])

  async function toggle(item) {
    try {
      const updated = await api(`/admin/students/${item.id}/`, { method: 'PATCH', body: JSON.stringify({ is_active: !item.is_active }) })
      setRows(rows.map((row) => (row.id === item.id ? updated : row)))
    } catch (reason) { setError(reason.message) }
  }

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Manage <span>students.</span></h1>
          <p>Activate or suspend learner accounts across the platform.</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="admin-table">
          {rows.map((row) => (
            <div className="admin-row" key={row.id}>
              <div>
                <b>{row.first_name} {row.last_name} (@{row.username})</b>
                <small>{row.email}</small>
              </div>
              <button className="button button-outline button-small" onClick={() => toggle(row)}>
                {row.is_active ? 'Suspend account' : 'Reactivate account'}
              </button>
            </div>
          ))}
          {!error && !rows.length && <div className="empty-state">No students found.</div>}
        </div>
      </main>
    </AppLayout>
  )
}

function AdminModules() {
  const [modulesList, setModulesList] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    Promise.all([api('/modules/'), api('/categories/')])
      .then(([modulesPayload, categoriesPayload]) => {
        setModulesList(listOf(modulesPayload))
        setCategories(listOf(categoriesPayload))
      })
      .catch((reason) => setError(reason.message))
  }, [])

  async function createModule(event) {
    event.preventDefault()
    const form = event.currentTarget
    setError(''); setNotice('')
    const data = Object.fromEntries(new FormData(form))
    data.category = Number(data.category)
    data.estimated_minutes = Number(data.estimated_minutes)
    data.slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    try {
      const created = await api('/modules/', { method: 'POST', body: JSON.stringify(data) })
      setModulesList((current) => [...current, created])
      form.reset()
      setNotice('Module created as a draft. Publish it when it is ready.')
    } catch (reason) { setError(reason.message) }
  }

  async function updateModule(event, item) {
    event.preventDefault()
    setError(''); setNotice('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    data.category = Number(data.category)
    data.estimated_minutes = Number(data.estimated_minutes)
    try {
      const updated = await api(`/modules/${item.slug}/`, { method: 'PATCH', body: JSON.stringify(data) })
      setModulesList((current) => current.map((module) => (module.id === item.id ? updated : module)))
      setNotice('Module details saved.')
    } catch (reason) { setError(reason.message) }
  }

  async function togglePublished(item) {
    try {
      const updated = await api(`/modules/${item.slug}/`, { method: 'PATCH', body: JSON.stringify({ is_published: !item.is_published }) })
      setModulesList((current) => current.map((module) => (module.id === item.id ? updated : module)))
    } catch (reason) { setError(reason.message) }
  }

  async function deleteModule(item) {
    if (!window.confirm(`Delete "${item.title}" and its lessons? This cannot be undone.`)) return
    try {
      await api(`/modules/${item.slug}/`, { method: 'DELETE' })
      setModulesList((current) => current.filter((module) => module.id !== item.id))
    } catch (reason) { setError(reason.message) }
  }

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Manage <span>learning modules.</span></h1>
          <p>Create, update, publish, and retire learning paths.</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        {notice && <div className="success-message">{notice}</div>}
        <section className="dash-card admin-editor">
          <h2>Create a learning module</h2>
          <form className="auth-form" onSubmit={createModule}>
            <label>Title<input name="title" required maxLength={180} /></label>
            <label>URL slug<input name="slug" required maxLength={200} /></label>
            <label>
              Category
              <select name="category" required defaultValue="">
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>Description<textarea name="description" rows="3" required /></label>
            <label>
              Difficulty
              <select name="difficulty" defaultValue="beginner">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label>Estimated minutes<input name="estimated_minutes" type="number" min="1" max="240" defaultValue="10" required /></label>
            <button className="button button-primary">Create draft <ArrowRight size={15} /></button>
          </form>
        </section>
        <div className="admin-table">
          {modulesList.map((item) => (
            <details className="admin-module" key={item.id}>
              <summary>
                <span><b>{item.title}</b><small>{item.category_name} · {item.is_published ? 'Published' : 'Draft'}</small></span>
                <ChevronRight size={17} />
              </summary>
              <form className="auth-form" onSubmit={(event) => updateModule(event, item)}>
                <label>Title<input name="title" defaultValue={item.title} required maxLength={180} /></label>
                <label>
                  Category
                  <select name="category" defaultValue={item.category}>
                    {categories.map((category) => (
                      <option value={category.id} key={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label>Description<textarea name="description" defaultValue={item.description} rows="3" required /></label>
                <label>
                  Difficulty
                  <select name="difficulty" defaultValue={item.difficulty}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
                <label>Estimated minutes<input name="estimated_minutes" type="number" min="1" max="240" defaultValue={item.estimated_minutes} required /></label>
                <div className="admin-actions">
                  <button className="button button-outline button-small">Save changes</button>
                  <button type="button" className="button button-outline button-small" onClick={() => togglePublished(item)}>
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className="button button-quiet button-small" onClick={() => deleteModule(item)}>Delete</button>
                </div>
                <small>To author lesson text and knowledge-check answers, use the <a href={`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '')}/admin/awareness/lesson/`} target="_blank" rel="noreferrer">Django lesson editor</a>.</small>
              </form>
            </details>
          ))}
          {modulesList.length === 0 && <div className="empty-state">No modules found. Add one above.</div>}
        </div>
      </main>
    </AppLayout>
  )
}

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api('/categories/').then((payload) => setCategories(listOf(payload))).catch((reason) => setError(reason.message))
  }, [])

  async function createCategory(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    data.slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    try {
      const created = await api('/categories/', { method: 'POST', body: JSON.stringify(data) })
      setCategories((current) => [...current, created])
      form.reset()
      setError(''); setNotice('Category created.')
    } catch (reason) { setError(reason.message) }
  }

  async function saveCategory(event, category) {
    event.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget))
      const updated = await api(`/categories/${category.id}/`, { method: 'PATCH', body: JSON.stringify(data) })
      setCategories((current) => current.map((item) => (item.id === category.id ? updated : item)))
      setError(''); setNotice('Category updated.')
    } catch (reason) { setError(reason.message) }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete category "${category.name}"? Categories assigned to modules cannot be deleted.`)) return
    try {
      await api(`/categories/${category.id}/`, { method: 'DELETE' })
      setCategories((current) => current.filter((item) => item.id !== category.id))
      setError(''); setNotice('Category deleted.')
    } catch (reason) { setError(reason.message) }
  }

  return (
    <AppLayout>
      <main className="app-page">
        <div className="page-intro">
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Manage <span>categories.</span></h1>
          <p>Organize learning modules by the digital safety topics they cover.</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        {notice && <div className="success-message">{notice}</div>}
        <section className="dash-card admin-editor">
          <h2>Create a category</h2>
          <form className="auth-form" onSubmit={createCategory}>
            <label>Name<input name="name" required maxLength={100} /></label>
            <label>URL slug<input name="slug" required maxLength={110} /></label>
            <label>Description<input name="description" maxLength={240} /></label>
            <button className="button button-primary">Add category <ArrowRight size={15} /></button>
          </form>
        </section>
        <div className="admin-table">
          {categories.map((category) => (
            <details className="admin-module" key={category.id}>
              <summary>
                <span><b>{category.name}</b><small>{category.slug}</small></span>
                <ChevronRight size={17} />
              </summary>
              <form className="auth-form" onSubmit={(event) => saveCategory(event, category)}>
                <label>Name<input name="name" defaultValue={category.name} required maxLength={100} /></label>
                <label>URL slug<input name="slug" defaultValue={category.slug} required maxLength={110} /></label>
                <label>Description<input name="description" defaultValue={category.description} maxLength={240} /></label>
                <div className="admin-actions">
                  <button className="button button-outline button-small">Save changes</button>
                  <button type="button" className="button button-quiet button-small" onClick={() => deleteCategory(category)}>Delete</button>
                </div>
              </form>
            </details>
          ))}
        </div>
      </main>
    </AppLayout>
  )
}

function getMissionBriefing(content) {
  const sections = content.split(/\n\s*\n/)
  const scenario = sections[0] || content
  const extract = (label) => {
    const match = content.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:Warning signs|Safer move|Try this):|$)`, 'i'))
    return match?.[1]?.trim() || ''
  }
  const warningSigns = extract('Warning signs')
  const saferMove = extract('Safer move')
  const tryThis = extract('Try this')
  const clues = warningSigns
    .split(/[,;]|\s+and\s+/i)
    .map((clue) => clue.trim().replace(/[.!]$/, ''))
    .filter((clue) => clue.length > 12)
    .slice(0, 4)
  return { scenario, warningSigns, saferMove, tryThis, clues }
}

function getTacticalClue(question, briefing) {
  if (question.hint && question.hint.trim().length > 5) {
    return question.hint.trim()
  }
  const prompt = (question.prompt || '').toLowerCase()
  if (prompt.includes('first') || prompt.includes('safest') || prompt.includes('response')) {
    return 'Prioritize verification through an independent, official route rather than acting directly on unexpected messages.'
  }
  if (prompt.includes('domain') || prompt.includes('sender') || prompt.includes('address') || prompt.includes('email') || prompt.includes('url')) {
    return 'Look-alike domains, mismatched subdomains, and misspelled URLs are primary giveaway signatures of impersonation attacks.'
  }
  if (prompt.includes('upi') || prompt.includes('payment') || prompt.includes('qr') || prompt.includes('pin') || prompt.includes('money')) {
    return 'Golden Rule of UPI: Entering your PIN or scanning a QR code is strictly for SENDING money, never for receiving incoming funds.'
  }
  if (prompt.includes('otp') || prompt.includes('code') || prompt.includes('password') || prompt.includes('credential')) {
    return 'Legitimate support teams and automated portals will NEVER require you to reveal your one-time passwords or master keys.'
  }
  if (prompt.includes('report') || prompt.includes('suspicious') || prompt.includes('harassment')) {
    return 'Always preserve evidence and report through official in-app or campus channels rather than forwarding or replying directly.'
  }
  return briefing.saferMove || 'Pause, take a breath, and verify through an independent channel before taking action.'
}

function LessonDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [modules, setModules] = useState([])
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const { id } = useParams()
  const [results, setResults] = useState({})
  const [missionStages, setMissionStages] = useState({})
  const [selectedClues, setSelectedClues] = useState({})
  const [nextMission, setNextMission] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [hintsOpen, setHintsOpen] = useState({})

  useEffect(() => {
    setData(null)
    setModules([])
    setError('')
    setNextMission(null)
    setCountdown(null)
    setHintsOpen({})
    Promise.all([api(`/modules/${id}/`), api('/modules/')])
      .then(([module, moduleList]) => {
        setData(module)
        setModules(listOf(moduleList))
      })
      .catch((reason) => setError(reason.message))
  }, [id])

  useEffect(() => {
    if (countdown === null) return undefined
    if (countdown <= 0) {
      const destination = nextMission?.path || '/learn'
      setCountdown(null)
      navigate(destination)
      return undefined
    }
    const timer = window.setTimeout(() => {
      setCountdown((current) => (current !== null && current > 0 ? current - 1 : null))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, nextMission, navigate])

  function advanceMission(lesson, nextStage) {
    setMissionStages((current) => ({ ...current, [lesson.id]: nextStage }))
  }

  function toggleClue(lesson, clue) {
    setSelectedClues((current) => {
      const selected = current[lesson.id] || []
      return {
        ...current,
        [lesson.id]: selected.includes(clue)
          ? selected.filter((item) => item !== clue)
          : [...selected, clue],
      }
    })
  }

  async function complete(lesson) {
    try {
      const lessonAnswers = lesson.questions.map((_, index) => answers[lesson.id]?.[index])
      const response = await api(`/lessons/${lesson.id}/complete/`, { method: 'POST', body: JSON.stringify({ answers: lessonAnswers }) })
      setResults((current) => ({ ...current, [lesson.id]: response }))
      if (response.passed) {
        const moduleIndex = modules.findIndex((module) => module.slug === id)
        const nextModule = moduleIndex >= 0 ? modules[moduleIndex + 1] : undefined
        setNextMission({
          path: nextModule ? `/learn/${nextModule.slug}` : '/learn',
          title: nextModule?.title || 'Browse all learning paths',
        })
        setCountdown(5)
      }
    } catch (reason) { setError(reason.message) }
  }

  return (
    <AppLayout>
      <main className="app-page">
        {error && <div className="error-message">{error}</div>}
        {data ? (
          <>
            <div className="page-intro">
              <Link to="/learn" className="back-link">← All learning paths</Link>
              <span className="eyebrow">{data.category_name || 'DIGITAL SAFETY'}</span>
              <h1>{data.title.split(' ').slice(0, -1).join(' ')} <span>{data.title.split(' ').slice(-1)}</span></h1>
              <p>{data.description}</p>
            </div>

            {data.lessons?.map((lesson, index) => {
              const briefing = getMissionBriefing(lesson.content)
              const stage = missionStages[lesson.id] || 'scene'
              const clues = briefing.clues.length ? briefing.clues : [briefing.warningSigns || briefing.scenario]
              const answeredCount = lesson.questions.filter((_, qi) => answers[lesson.id]?.[qi] !== undefined).length

              return (
                <section className="lesson-card mission-card" key={lesson.id}>
                  {/* INTERACTIVE 3D MISSION RADAR SCANNER */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
                    <CyberScanner3D height={190} />
                  </div>

                  <div className="mission-heading">
                    <span className="eyebrow">MISSION 0{index + 1} · FIELD TRAINING SIMULATOR</span>
                    <span className="mission-reward"><Zap size={14} /> +20 XP on pass</span>
                  </div>
                  <h2>{lesson.title}</h2>
                  <div className="mission-progress" aria-label="Mission briefing progress">
                    {[['scene', 'The scene'], ['clues', 'Find the clues'], ['guide', 'Field guide'], ['quiz', 'Quick check']].map(([step, label], stepIndex) => {
                      const stages = ['scene', 'clues', 'guide', 'quiz']
                      const activeIndex = stages.indexOf(stage)
                      return (
                        <div className={stepIndex <= activeIndex ? 'mission-step mission-step-active' : 'mission-step'} key={step}>
                          <span>{stepIndex < activeIndex ? <Check size={13} /> : `0${stepIndex + 1}`}</span>
                          {label}
                        </div>
                      )
                    })}
                  </div>

                  {stage === 'scene' && (
                    <div className="mission-scene">
                      <span className="mission-scene-icon"><Eye size={21} /></span>
                      <span className="eyebrow">LIVE SCENARIO BRIEFING</span>
                      <p>{briefing.scenario}</p>
                      <div className="mission-prompt">
                        <Sparkles size={16} />
                        <span>No pressure to answer yet. First, look around and identify anything that feels off.</span>
                      </div>
                      <button className="button button-primary" onClick={() => advanceMission(lesson, 'clues')}>
                        Scan for red flags <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {stage === 'clues' && (
                    <div className="clue-hunt">
                      <span className="eyebrow">CLUE HUNT · TAP ANY SIGN THAT SHOULD MAKE YOU PAUSE</span>
                      <h3>What gives away this attack?</h3>
                      <p>These are clues, not a test. Pick one to inspect why it triggers suspicion.</p>
                      <div className="clue-options">
                        {clues.map((clue) => (
                          <button
                            type="button"
                            className={selectedClues[lesson.id]?.includes(clue) ? 'clue-chip clue-chip-selected' : 'clue-chip'}
                            key={clue}
                            onClick={() => toggleClue(lesson, clue)}
                          >
                            <Eye size={15} />
                            {clue}
                          </button>
                        ))}
                      </div>
                      {selectedClues[lesson.id]?.length > 0 && (
                        <div className="clue-feedback" role="status">
                          <Check size={17} />
                          <span><b>Sharp observation.</b> “{selectedClues[lesson.id][selectedClues[lesson.id].length - 1]}” is a telltale signature of this scam. Let’s learn the safer response.</span>
                        </div>
                      )}
                      <div style={{ marginTop: 20 }}>
                        <button className="button button-primary" disabled={!selectedClues[lesson.id]?.length} onClick={() => advanceMission(lesson, 'guide')}>
                          Reveal the field guide <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {stage === 'guide' && (
                    <div className="field-guide">
                      <span className="eyebrow"><ShieldCheck size={14} /> FIELD GUIDE · SAFER DIGITAL RESPONSE</span>
                      <h3>Your safer move</h3>
                      <p>{briefing.saferMove || 'Pause, avoid acting under pressure, and verify through an official channel you find independently.'}</p>
                      {briefing.tryThis && (
                        <div className="try-this">
                          <Target size={17} />
                          <span><b>Try this in real life: </b>{briefing.tryThis}</span>
                        </div>
                      )}
                      <div className="mission-prompt">
                        <Sparkles size={16} />
                        <span>Now you’ve inspected the scenario, clues, and defensive countermove. Ready to test your reflexes?</span>
                      </div>
                      <button className="button button-primary" onClick={() => advanceMission(lesson, 'quiz')}>
                        I’m ready for the challenge <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {results[lesson.id]?.passed ? (
                    <div className="mission-success" role="status">
                      <span className="mission-success-icon"><Award size={28} /></span>
                      <span className="eyebrow">CHALLENGE CLEARED</span>
                      <h3>Mission accomplished!</h3>
                      <p>
                        You scored {results[lesson.id].score}% and earned {results[lesson.id].points_awarded} points
                        {results[lesson.id].points_awarded === 0 ? ' (points previously collected)' : ''}.
                      </p>
                      <div className="next-mission-card">
                        <span>
                          <span className="eyebrow">UP NEXT</span>
                          <b>{nextMission?.title || 'Browse all learning paths'}</b>
                        </span>
                        <ArrowRight size={18} />
                      </div>
                      {countdown !== null && <p className="mission-countdown">Proceeding to next mission in {countdown} seconds…</p>}
                      <div className="mission-success-actions">
                        <button className="button button-primary" onClick={() => { setCountdown(null); navigate(nextMission?.path || '/learn') }}>
                          Continue now <ArrowRight size={16} />
                        </button>
                        {countdown !== null && (
                          <button className="button button-outline" onClick={() => setCountdown(null)}>
                            Stay on this lesson
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    stage === 'quiz' && (
                      <>
                        {/* QUIZ HEADER TELEMETRY BAR */}
                        <div className="quiz-header-bar">
                          <div className="quiz-progress-text">
                            <Target size={19} style={{ color: 'var(--highlight)' }} />
                            <span>Challenge Progress: <b>{answeredCount} of {lesson.questions.length} answered</b></span>
                          </div>
                          <span className="quiz-progress-pill">
                            {answeredCount === lesson.questions.length ? '✓ All Answered · Ready to Submit' : 'Pass threshold: 80% (4/5 correct)'}
                          </span>
                        </div>

                        {/* QUIZ GUIDANCE BANNER */}
                        <div className="mission-prompt" style={{ marginBottom: 20 }}>
                          <Sparkles size={18} />
                          <span>
                            <b>Tactical Assistance Available:</b> Read each question carefully. If you are unsure of the answer, tap <b>"💡 Need a clue?"</b> below each question to inspect the defensive rule and reveal how to spot the safe move!
                          </span>
                        </div>

                        {/* QUESTIONS WITH CLUE / HINT SYSTEM */}
                        {lesson.questions.map((question, qi) => {
                          const isAnswered = answers[lesson.id]?.[qi] !== undefined
                          const isHintVisible = Boolean(hintsOpen[qi])
                          const tacticalClue = getTacticalClue(question, briefing)

                          return (
                            <fieldset className={`quiz-question ${isAnswered ? 'question-answered' : ''}`} key={qi}>
                              <span className="quiz-question-badge">
                                QUESTION 0{qi + 1} OF 0{lesson.questions.length}
                              </span>
                              <legend>{question.prompt}</legend>

                              {/* CLUE TOGGLE BUTTON */}
                              <div>
                                <button
                                  type="button"
                                  className="clue-toggle-btn"
                                  onClick={() => setHintsOpen((curr) => ({ ...curr, [qi]: !curr[qi] }))}
                                  aria-expanded={isHintVisible}
                                >
                                  <Lightbulb size={16} />
                                  {isHintVisible ? 'Hide Clue & Tactical Advice' : '💡 Need a clue? Tap to reveal hint & advice'}
                                </button>
                              </div>

                              {/* EXPANDABLE CLUE & HINT BOX */}
                              {isHintVisible && (
                                <div className="clue-box" role="region" aria-label="Question tactical clue">
                                  <div className="clue-box-title">
                                    <Sparkles size={16} /> TACTICAL DEFENSE INTEL
                                  </div>
                                  <p className="clue-box-text">{tacticalClue}</p>
                                  <div className="clue-box-tip">
                                    <b>💡 How to know what to do:</b> Look for the option that emphasizes independent verification, never sharing OTP/PINs, or using official apps instead of clicking urgent links. Avoid choices that involve hasty clicks or replying directly.
                                  </div>
                                </div>
                              )}

                              {/* LARGE, CLEAR OPTIONS */}
                              <div className="quiz-options-list">
                                {question.options.map((option, oi) => {
                                  const isSelected = answers[lesson.id]?.[qi] === oi
                                  return (
                                    <label
                                      key={oi}
                                      className={`quiz-option-label ${isSelected ? 'quiz-option-selected' : ''}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q-${lesson.id}-${qi}`}
                                        checked={isSelected}
                                        onChange={() =>
                                          setAnswers((current) => ({
                                            ...current,
                                            [lesson.id]: { ...current[lesson.id], [qi]: oi },
                                          }))
                                        }
                                      />
                                      <span>{option}</span>
                                      {isSelected && <Check size={18} style={{ marginLeft: 'auto', color: 'var(--highlight)', flexShrink: 0 }} />}
                                    </label>
                                  )
                                })}
                              </div>
                            </fieldset>
                          )
                        })}

                        <div style={{ marginTop: 24 }}>
                          <button
                            className="button button-primary"
                            disabled={!user || answeredCount < lesson.questions.length}
                            onClick={() => complete(lesson)}
                          >
                            {user
                              ? answeredCount < lesson.questions.length
                                ? `Answer all questions (${answeredCount}/${lesson.questions.length})`
                                : 'Submit challenge responses'
                              : 'Sign in to record your progress'} <ArrowRight size={16} />
                          </button>
                        </div>

                        {results[lesson.id] && (
                          <p className={results[lesson.id].passed ? 'success-message' : 'error-message'} style={{ marginTop: 16 }}>
                            {results[lesson.id].passed
                              ? `Mission cleared! You scored ${results[lesson.id].score}% and earned ${results[lesson.id].points_awarded} points!`
                              : `Not quite yet (${results[lesson.id].score}%). Review the clues above and try again!`}
                          </p>
                        )}
                      </>
                    )
                  )}
                </section>
              )
            })}
          </>
        ) : (
          !error && <div className="loading-state">Loading mission parameters…</div>
        )}
      </main>
    </AppLayout>
  )
}

export default function App() {
  const { user } = useAuth()
  const defaultAuthDestination = user?.is_staff ? '/admin' : '/dashboard'

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={defaultAuthDestination} replace /> : <AuthPage />} />
      <Route path="/register" element={user ? <Navigate to={defaultAuthDestination} replace /> : <AuthPage register />} />
      <Route path="/forgot-password" element={<AuthPage resetRequest />} />
      <Route path="/reset-password/:uid/:token" element={<AuthPage resetCredentials />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
      <Route path="/cyber-safety" element={<CyberSafety />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
      <Route path="/admin/modules" element={<ProtectedRoute admin><AdminModules /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute admin><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute admin><AdminList type="students" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
