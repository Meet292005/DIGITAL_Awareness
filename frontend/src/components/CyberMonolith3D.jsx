import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberMonolith3D({ className = '' }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let monolithGroup, leftBlock, rightBlock, laserSeam, groundGlow, topPlate
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 500
      const height = container.clientHeight || 500

      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
      camera.position.set(0, 0.2, 5.5)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      container.appendChild(renderer.domElement)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x060a14, 2.5)
      scene.add(ambientLight)

      // Emerald green underglow / pedestal light
      const greenBaseLight = new THREE.PointLight(0x00ff88, 6.0, 10)
      greenBaseLight.position.set(0, -1.8, 1.2)
      scene.add(greenBaseLight)

      const greenSeamLight = new THREE.PointLight(0x00ff88, 3.5, 6)
      greenSeamLight.position.set(0, 0, 1.4)
      scene.add(greenSeamLight)

      // Subtle violet rim light from top-left (matches reference image ambient purple)
      const violetRimLight = new THREE.DirectionalLight(0x8b5cf6, 2.8)
      violetRimLight.position.set(-3, 4, -2)
      scene.add(violetRimLight)

      // Soft key light from top-front
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
      keyLight.position.set(2, 3, 4)
      scene.add(keyLight)

      // Monolith Group
      monolithGroup = new THREE.Group()
      scene.add(monolithGroup)

      // Monolith Material: Sleek matte obsidian / dark carbon metal
      const monolithMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0e18,
        roughness: 0.28,
        metalness: 0.82,
        flatShading: false,
      })

      // Chamfered / Rounded box geometry for left and right halves
      const blockWidth = 0.95
      const blockHeight = 2.4
      const blockDepth = 1.9
      const gap = 0.04

      const boxGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth, 8, 8, 8)

      // Left Half
      leftBlock = new THREE.Mesh(boxGeo, monolithMaterial)
      leftBlock.position.set(-(blockWidth / 2 + gap / 2), 0, 0)
      monolithGroup.add(leftBlock)

      // Right Half
      rightBlock = new THREE.Mesh(boxGeo, monolithMaterial)
      rightBlock.position.set((blockWidth / 2 + gap / 2), 0, 0)
      monolithGroup.add(rightBlock)

      // Top chamfered cap / rim accent
      const capGeo = new THREE.BoxGeometry(blockWidth * 2 + gap, 0.08, blockDepth)
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x141e30,
        roughness: 0.2,
        metalness: 0.9,
      })
      topPlate = new THREE.Mesh(capGeo, capMat)
      topPlate.position.set(0, blockHeight / 2 + 0.04, 0)
      monolithGroup.add(topPlate)

      // Glowing Neon Laser Seam in the center split
      const seamGeo = new THREE.PlaneGeometry(0.025, blockHeight)
      const seamMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      })
      laserSeam = new THREE.Mesh(seamGeo, seamMat)
      laserSeam.position.set(0, 0, blockDepth / 2 + 0.005)
      monolithGroup.add(laserSeam)

      // Laser Seam Back
      const laserSeamBack = new THREE.Mesh(seamGeo, seamMat)
      laserSeamBack.position.set(0, 0, -(blockDepth / 2 + 0.005))
      monolithGroup.add(laserSeamBack)

      // Neon Emerald Base Ring / Pedestal Underglow
      const ringGeo = new THREE.RingGeometry(0.8, 1.8, 48)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      })
      groundGlow = new THREE.Mesh(ringGeo, ringMat)
      groundGlow.rotation.x = -Math.PI / 2
      groundGlow.position.set(0, -(blockHeight / 2 + 0.08), 0)
      monolithGroup.add(groundGlow)

      // Bottom green laser rim outline
      const baseOutlineGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(blockWidth * 2 + gap + 0.02, 0.04, blockDepth + 0.02))
      const baseOutlineMat = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 })
      const baseOutline = new THREE.LineSegments(baseOutlineGeo, baseOutlineMat)
      baseOutline.position.set(0, -(blockHeight / 2 + 0.02), 0)
      monolithGroup.add(baseOutline)

      // Initial angle matching reference: slight turn to the right
      monolithGroup.rotation.y = 0.38
      monolithGroup.rotation.x = 0.08

      // Mouse Parallax listener
      const onMouseMove = (event) => {
        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        targetX = (x / rect.width) * 0.45
        targetY = (y / rect.height) * 0.35
      }

      window.addEventListener('mousemove', onMouseMove)

      // Window resize
      const onResize = () => {
        if (!container) return
        const w = container.clientWidth || 500
        const h = container.clientHeight || 500
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      // Animation Loop
      let clock = new THREE.Clock()

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const elapsedTime = clock.getElapsedTime()

        // Smooth damping interpolation toward mouse target
        mouseX += (targetX - mouseX) * 0.05
        mouseY += (targetY - mouseY) * 0.05

        // Gentle floating breathing oscillation
        const floatY = Math.sin(elapsedTime * 1.5) * 0.04

        monolithGroup.position.y = floatY
        monolithGroup.rotation.y = 0.38 + mouseX + Math.sin(elapsedTime * 0.5) * 0.05
        monolithGroup.rotation.x = 0.08 + mouseY

        // Pulsate emerald seam & ground glow
        const pulse = Math.sin(elapsedTime * 3) * 0.15 + 0.85
        seamMat.opacity = pulse
        ringMat.opacity = pulse * 0.45
        greenBaseLight.intensity = 5.0 + pulse * 2.0

        renderer.render(scene, camera)
      }

      animate()

      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)
        cancelAnimationFrame(animationFrameId)
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    } catch (e) {
      console.warn('WebGL initialization failed, falling back:', e)
      setHasWebGL(false)
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div className={`monolith-fallback ${className}`}>
        <div className="monolith-static-cube">
          <div className="cube-laser-seam" />
          <div className="cube-pedestal-glow" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`cyber-monolith-canvas-wrapper ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        maxHeight: '560px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}
