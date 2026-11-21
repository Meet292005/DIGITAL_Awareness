import { useState, useRef, useEffect } from 'react'
import { Terminal, Send, Play, RefreshCw, ShieldAlert, CheckCircle2, Zap } from 'lucide-react'
import { cyberSound } from '../utils/cyberSound'

const PRESET_COMMANDS = [
  { cmd: 'scan', label: 'Network Scan', desc: 'Scan active vector for vulnerabilities' },
  { cmd: 'phish-test', label: 'Analyze Phish', desc: 'Inspect simulated credential harvester' },
  { cmd: 'defend', label: 'Deploy Shields', desc: 'Engage 2FA & DNS firewall defense' },
  { cmd: 'matrix', label: 'Matrix Rain', desc: 'Stream decrypted threat telemetry' },
  { cmd: 'help', label: 'Help', desc: 'List all operational commands' },
]

export default function CyberTerminal() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'DIGIAWARE DEFENSE OS v3.8.4 [ONLINE]' },
    { type: 'system', text: 'Active Threat Matrix: Telemetry streaming from Sector 9.' },
    { type: 'system', text: 'Type a command below or tap a quick-action chip to begin.' },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const executeCommand = (rawCmd) => {
    const cmd = rawCmd.trim().toLowerCase()
    if (!cmd) return

    cyberSound.playClick()
    setHistory((prev) => [...prev, { type: 'user', text: `$ ${rawCmd}` }])
    setInput('')
    setIsProcessing(true)

    setTimeout(() => {
      if (cmd === 'clear') {
        setHistory([])
        setIsProcessing(false)
        return
      }

      if (cmd === 'help') {
        cyberSound.playSuccess()
        setHistory((prev) => [
          ...prev,
          { type: 'info', text: '--- AVAILABLE CYBER DEFENSE DIRECTIVES ---' },
          { type: 'text', text: '  scan        : Port sweep & threat vector diagnostic' },
          { type: 'text', text: '  phish-test  : Heuristic inspection of active phishing lure' },
          { type: 'text', text: '  defend      : Initialize hardware MFA & lockdown DNS routing' },
          { type: 'text', text: '  matrix      : High-velocity decrypted telemetry feed' },
          { type: 'text', text: '  clear       : Wipe terminal output' },
          { type: 'text', text: '-------------------------------------------' },
        ])
        setIsProcessing(false)
        return
      }

      if (cmd === 'scan') {
        cyberSound.playScan()
        setHistory((prev) => [
          ...prev,
          { type: 'warning', text: '[!] INITIALIZING LOCAL ENVIRONMENT AUDIT...' },
          { type: 'text', text: '[-] Probing gateway interfaces... 12/12 responsive.' },
          { type: 'text', text: '[-] Checking DNS resolver authenticity... PASS (Cloudflare 1.1.1.1 TLS)' },
          { type: 'alert', text: '[VULN DETECTED] Unencrypted HTTP traffic possible on public Wi-Fi.' },
          { type: 'success', text: '[MITIGATION] Always enforce HTTPS Everywhere & use encrypted VPN tunnels.' },
          { type: 'success', text: '[AUDIT COMPLETE] Defense readiness score: 88/100' },
        ])
        setIsProcessing(false)
        return
      }

      if (cmd === 'phish-test') {
        cyberSound.playScan()
        setHistory((prev) => [
          ...prev,
          { type: 'warning', text: '[+] PARSING SUSPICIOUS PAYLOAD: "https://paypa1-security-check.xyz/login"' },
          { type: 'alert', text: '  [!] Typo-squatting detected: Character "1" used instead of "l".' },
          { type: 'alert', text: '  [!] Domain registered: 14 hours ago (High Risk TLD: .xyz)' },
          { type: 'alert', text: '  [!] Form destination: Extracted POST data routes to unauthorized IP.' },
          { type: 'success', text: '[RESULT: 99.4% PHISHING THREAT] Vector blocked. No credentials leaked.' },
        ])
        cyberSound.playSuccess()
        setIsProcessing(false)
        return
      }

      if (cmd === 'defend') {
        cyberSound.playFanfare()
        setHistory((prev) => [
          ...prev,
          { type: 'success', text: '[SHIELD ACTIVE] FIDO2 Hardware Security Keys enforced.' },
          { type: 'success', text: '[SHIELD ACTIVE] Automated SMS OTP interception protection engaged.' },
          { type: 'success', text: '[SHIELD ACTIVE] Encrypted DoH (DNS-over-HTTPS) telemetry enabled.' },
          { type: 'system', text: 'Your workstation defense perimeter is fully fortified.' },
        ])
        setIsProcessing(false)
        return
      }

      if (cmd === 'matrix') {
        cyberSound.playScan()
        const hexStream = [
          '0x7F 0x45 0x4C 0x46 ... [SYS_CALL_INTERCEPT_OK]',
          '0x3A 0x8F 0x12 0xAA ... [RSA_4096_VALIDATED]',
          '0xCC 0x90 0x90 0xEB ... [BUFFER_OVERFLOW_BLOCKED]',
          '0x00 0x1A 0xFE 0x42 ... [TELEMETRY_SYNCED]',
        ]
        setHistory((prev) => [
          ...prev,
          ...hexStream.map((t) => ({ type: 'matrix', text: t })),
        ])
        setIsProcessing(false)
        return
      }

      cyberSound.playError()
      setHistory((prev) => [
        ...prev,
        { type: 'error', text: `Command not recognized: "${rawCmd}". Type "help" for valid directives.` },
      ])
      setIsProcessing(false)
    }, 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    executeCommand(input)
  }

  return (
    <div className="cyber-terminal-card">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-green" />
        </div>
        <div className="terminal-title">
          <Terminal size={14} />
          <span>TERMINAL // CYBER_DEFENSE_SHELL</span>
        </div>
        <button
          type="button"
          className="terminal-clear-btn"
          onClick={() => {
            cyberSound.playClick()
            setHistory([])
          }}
          title="Clear Terminal"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="terminal-chips">
        {PRESET_COMMANDS.map((item) => (
          <button
            key={item.cmd}
            type="button"
            className="terminal-chip"
            onClick={() => executeCommand(item.cmd)}
            disabled={isProcessing}
          >
            <Play size={10} />
            <span>{item.cmd}</span>
          </button>
        ))}
      </div>

      <div className="terminal-body" tabIndex={0} aria-label="Terminal output log">
        {history.map((line, idx) => {
          let lineClass = 'terminal-line'
          if (line.type === 'user') lineClass += ' line-user'
          if (line.type === 'system') lineClass += ' line-system'
          if (line.type === 'info') lineClass += ' line-info'
          if (line.type === 'warning') lineClass += ' line-warning'
          if (line.type === 'alert') lineClass += ' line-alert'
          if (line.type === 'success') lineClass += ' line-success'
          if (line.type === 'error') lineClass += ' line-error'
          if (line.type === 'matrix') lineClass += ' line-matrix'

          return (
            <div key={idx} className={lineClass}>
              {line.text}
            </div>
          )
        })}
        {isProcessing && (
          <div className="terminal-line line-system">
            <span className="terminal-spinner" /> Processing directive...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="terminal-input-bar" onSubmit={handleSubmit}>
        <span className="terminal-prompt">&gt;</span>
        <input
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter directive (e.g. scan, phish-test, defend, help)..."
          disabled={isProcessing}
        />
        <button
          type="submit"
          className="terminal-send-btn"
          disabled={isProcessing || !input.trim()}
          aria-label="Send command"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
