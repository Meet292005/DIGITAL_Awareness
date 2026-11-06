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

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // Generate constellation nodes
    const nodeCount = Math.min(45, Math.floor(width / 35))
    const nodes = []
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.8 + 1,
        color: Math.random() > 0.4 ? 'rgba(56, 189, 248, ' : 'rgba(129, 140, 248, ',
        alpha: Math.random() * 0.4 + 0.2,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Connect near nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i]
        n1.x += n1.vx
        n1.y += n1.vy

        if (n1.x < 0 || n1.x > width) n1.vx *= -1
        if (n1.y < 0 || n1.y > height) n1.vy *= -1

        ctx.beginPath()
        ctx.arc(n1.x, n1.y, n1.size, 0, Math.PI * 2)
        ctx.fillStyle = `${n1.color}${n1.alpha})`
        ctx.fill()

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]
          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 130) * 0.12})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', onResize)
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
        opacity: 0.65,
      }}
    />
  )
}
