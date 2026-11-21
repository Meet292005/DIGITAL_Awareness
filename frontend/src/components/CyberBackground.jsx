import { useEffect, useRef } from 'react'

export default function CyberBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let mouse = { x: width / 2, y: height / 2, active: false }

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    const onMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    const onMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    // Generate telemetry nodes
    const nodeCount = Math.min(55, Math.floor(width / 26))
    const nodes = []
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.35 ? '34, 211, 238' : '129, 140, 248', // cyan or indigo
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    // Packets moving along links
    const packets = []
    for (let i = 0; i < 6; i++) {
      packets.push({
        from: Math.floor(Math.random() * nodeCount),
        to: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
      })
    }

    let gridOffset = 0
    let scanlineY = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // 1. Subtle moving cyber grid on bottom half
      const horizonY = height * 0.55
      const gridHeight = height - horizonY
      gridOffset = (gridOffset + 0.35) % 40

      ctx.save()
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)'
      ctx.lineWidth = 1

      // Horizontal lines with perspective spacing
      for (let y = gridOffset; y < gridHeight; y += 40) {
        const p = y / gridHeight
        const lineY = horizonY + Math.pow(p, 1.8) * gridHeight
        ctx.beginPath()
        ctx.moveTo(0, lineY)
        ctx.lineTo(width, lineY)
        ctx.stroke()
      }

      // Vertical perspective lines converging to center horizon
      const vanishX = width * 0.5
      const numLines = Math.floor(width / 60)
      for (let i = -numLines; i <= numLines; i++) {
        const bottomX = vanishX + i * 80
        ctx.beginPath()
        ctx.moveTo(vanishX, horizonY)
        ctx.lineTo(bottomX, height)
        ctx.stroke()
      }
      ctx.restore()

      // 2. Mouse interactive radial ambient glow
      if (mouse.active) {
        const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 280)
        glowGrad.addColorStop(0, 'rgba(34, 211, 238, 0.08)')
        glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)')
        glowGrad.addColorStop(1, 'rgba(7, 11, 24, 0)')
        ctx.fillStyle = glowGrad
        ctx.fillRect(0, 0, width, height)
      }

      // 3. Connect near nodes & render active packets
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i]
        n1.x += n1.vx
        n1.y += n1.vy

        if (n1.x < 0 || n1.x > width) n1.vx *= -1
        if (n1.y < 0 || n1.y > height) n1.vy *= -1

        // Mouse deflection
        if (mouse.active) {
          const mdx = n1.x - mouse.x
          const mdy = n1.y - mouse.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (mdist < 100 && mdist > 0) {
            n1.x += (mdx / mdist) * 0.8
            n1.y += (mdy / mdist) * 0.8
          }
        }

        ctx.beginPath()
        ctx.arc(n1.x, n1.y, n1.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${n1.color}, ${n1.alpha})`
        ctx.fill()

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]
          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(${n1.color}, ${(1 - dist / 140) * 0.16})`
            ctx.lineWidth = 0.9
            ctx.stroke()
          }
        }
      }

      // 4. Data packets traversing nodes
      packets.forEach((p) => {
        p.progress += p.speed
        if (p.progress >= 1) {
          p.progress = 0
          p.from = Math.floor(Math.random() * nodes.length)
          p.to = Math.floor(Math.random() * nodes.length)
        }
        const n1 = nodes[p.from]
        const n2 = nodes[p.to]
        if (n1 && n2) {
          const px = n1.x + (n2.x - n1.x) * p.progress
          const py = n1.y + (n2.y - n1.y) * p.progress
          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(34, 211, 238, 0.9)'
          ctx.shadowColor = '#22d3ee'
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      // 5. Subtle moving cyber scanline
      scanlineY = (scanlineY + 1.2) % height
      const scanGrad = ctx.createLinearGradient(0, scanlineY, 0, scanlineY + 60)
      scanGrad.addColorStop(0, 'rgba(34, 211, 238, 0)')
      scanGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.025)')
      scanGrad.addColorStop(1, 'rgba(34, 211, 238, 0)')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanlineY, width, 60)

      animationFrameId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="cyber-background-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  )
}
