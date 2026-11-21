import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberMonolith3D({ className = '' }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let monolithGroup, leftBlock, rightBlock, laserSeamCore, laserSeamGlow, groundGlowMesh
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 520
      const height = container.clientHeight || 520

      camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000)
      camera.position.set(0, 0.15, 5.8)

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      container.appendChild(renderer.domElement)

      // ==========================================
      // STUDIO LIGHTING RIG (Balanced Gunmetal PBR)
      // ==========================================

      // 1. Ambient Fill: Keeps dark facets visible and prevents pitch-black dead spots
      const ambientLight = new THREE.AmbientLight(0x182438, 2.2)
      scene.add(ambientLight)

      // 2. Top-Front Key Light (Softbox Sheen on Top & Front Facets)
      const topKeyLight = new THREE.DirectionalLight(0xe0eaff, 3.4)
      topKeyLight.position.set(2.5, 6, 3.5)
      scene.add(topKeyLight)

      // 3. Left Fill Light (Shows Left Face & Chamfer Separation)
      const leftFillLight = new THREE.DirectionalLight(0x64748b, 1.8)
      leftFillLight.position.set(-4, 2, 3)
      scene.add(leftFillLight)

      // 4. Violet Rim Light (Matches Reference Mockup Ambient Violet Glow)
      const violetRimLight = new THREE.DirectionalLight(0xa855f7, 2.8)
      violetRimLight.position.set(-3.5, 3.5, -3)
      scene.add(violetRimLight)

      // 5. Sky Blue Secondary Rim Light (Depth on Back Right)
      const skyRimLight = new THREE.DirectionalLight(0x38bdf8, 1.4)
      skyRimLight.position.set(3.5, 2, -3)
      scene.add(skyRimLight)

      // 6. Floor Bounce Light (Underglow Reflex onto Bottom Bevels)
      const floorBounceLight = new THREE.PointLight(0x00ff88, 2.8, 3.5)
      floorBounceLight.position.set(0, -1.4, 0.4)
      scene.add(floorBounceLight)

      // ==========================================
      // MONOLITH GEOMETRY & MATERIALS
      // ==========================================
      monolithGroup = new THREE.Group()
      scene.add(monolithGroup)

      // Sleek Satin Gunmetal / Obsidian Titanium Material
      const monolithMaterial = new THREE.MeshStandardMaterial({
        color: 0x1b2334, // Rich dark gunmetal / titanium (not dead pitch black)
        roughness: 0.35, // Smooth satin sheen that catches soft studio highlights
        metalness: 0.72, // Metallic PBR reflectivity
        flatShading: false,
      })

      // Top Inset Plate Material
      const topPlateMaterial = new THREE.MeshStandardMaterial({
        color: 0x141b29,
        roughness: 0.42,
        metalness: 0.8,
        flatShading: false,
      })

      // Top Recessed Center Screen Material
      const topCenterMaterial = new THREE.MeshStandardMaterial({
        color: 0x222e44,
        roughness: 0.25,
        metalness: 0.85,
        flatShading: false,
      })

      const blockWidth = 0.96
      const blockHeight = 2.45
      const blockDepth = 1.95
      const gap = 0.035

      // Chamfered / Subdivided Box Geometry for Left and Right Halves
      const boxGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth, 16, 16, 16)
      boxGeo.computeVertexNormals()

      // Left Half Block
      leftBlock = new THREE.Mesh(boxGeo, monolithMaterial)
      leftBlock.position.set(-(blockWidth / 2 + gap / 2), 0, 0)
      monolithGroup.add(leftBlock)

      // Right Half Block
      rightBlock = new THREE.Mesh(boxGeo, monolithMaterial)
      rightBlock.position.set((blockWidth / 2 + gap / 2), 0, 0)
      monolithGroup.add(rightBlock)

      // Top Chamfered Rim / Inset Accent
      const rimGeo = new THREE.BoxGeometry(blockWidth * 2 + gap + 0.02, 0.06, blockDepth + 0.02)
      const topRim = new THREE.Mesh(rimGeo, topPlateMaterial)
      topRim.position.set(0, blockHeight / 2 + 0.03, 0)
      monolithGroup.add(topRim)

      // Inset Top Panel (Catches Studio Top Sheen)
      const insetGeo = new THREE.BoxGeometry(blockWidth * 2 + gap - 0.12, 0.02, blockDepth - 0.12)
      const topInset = new THREE.Mesh(insetGeo, topCenterMaterial)
      topInset.position.set(0, blockHeight / 2 + 0.06, 0)
      monolithGroup.add(topInset)

      // ==========================================
      // NEON EMERALD VERTICAL LASER SEAM
      // ==========================================

      // Core Laser Line (Front)
      const seamCoreGeo = new THREE.PlaneGeometry(0.018, blockHeight)
      const seamCoreMat = new THREE.MeshBasicMaterial({
        color: 0x66ffaa,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
      })
      laserSeamCore = new THREE.Mesh(seamCoreGeo, seamCoreMat)
      laserSeamCore.position.set(0, 0, blockDepth / 2 + 0.005)
      monolithGroup.add(laserSeamCore)

      // Outer Laser Bloom Halo (Front)
      const seamGlowGeo = new THREE.PlaneGeometry(0.08, blockHeight)
      const seamGlowMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
      laserSeamGlow = new THREE.Mesh(seamGlowGeo, seamGlowMat)
      laserSeamGlow.position.set(0, 0, blockDepth / 2 + 0.004)
      monolithGroup.add(laserSeamGlow)

      // Laser Line (Back)
      const laserSeamBack = new THREE.Mesh(seamCoreGeo, seamCoreMat)
      laserSeamBack.position.set(0, 0, -(blockDepth / 2 + 0.005))
      monolithGroup.add(laserSeamBack)

      // Interior Slit Light (Illuminates Inner Split Faces evenly)
      const interiorSplitLight = new THREE.PointLight(0x00ff88, 1.4, 2.5)
      interiorSplitLight.position.set(0, 0, 0)
      monolithGroup.add(interiorSplitLight)

      // ==========================================
      // REALISTIC GAUSSIAN RADIAL FLOOR GLOW (No hard rings!)
      // ==========================================
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0.0, 'rgba(0, 255, 136, 0.75)')
      gradient.addColorStop(0.2, 'rgba(0, 255, 136, 0.4)')
      gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.12)')
      gradient.addColorStop(0.8, 'rgba(0, 255, 136, 0.03)')
      gradient.addColorStop(1.0, 'rgba(0, 255, 136, 0.0)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 256)

      const glowTexture = new THREE.CanvasTexture(canvas)
      const groundGeo = new THREE.PlaneGeometry(3.6, 3.6)
      const groundMat = new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      groundGlowMesh = new THREE.Mesh(groundGeo, groundMat)
      groundGlowMesh.rotation.x = -Math.PI / 2
      groundGlowMesh.position.set(0, -(blockHeight / 2 + 0.08), 0)
      monolithGroup.add(groundGlowMesh)

      // Bottom Laser Perimeter Outline
      const baseOutlineGeo = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(blockWidth * 2 + gap + 0.01, 0.02, blockDepth + 0.01)
      )
      const baseOutlineMat = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.85,
      })
      const baseOutline = new THREE.LineSegments(baseOutlineGeo, baseOutlineMat)
      baseOutline.position.set(0, -(blockHeight / 2 + 0.01), 0)
      monolithGroup.add(baseOutline)

      // Initial orientation matching reference angle (slight turn to the right)
      monolithGroup.rotation.y = 0.38
      monolithGroup.rotation.x = 0.07

      // Mouse Parallax listener
      const onMouseMove = (event) => {
        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        targetX = (x / rect.width) * 0.38
        targetY = (y / rect.height) * 0.28
      }

      window.addEventListener('mousemove', onMouseMove)

      // Window resize handler
      const onResize = () => {
        if (!container) return
        const w = container.clientWidth || 520
        const h = container.clientHeight || 520
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      // Animation Loop
      const clock = new THREE.Clock()

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const elapsedTime = clock.getElapsedTime()

        // Smooth damping interpolation toward mouse target
        mouseX += (targetX - mouseX) * 0.05
        mouseY += (targetY - mouseY) * 0.05

        // Gentle floating breathing oscillation
        const floatY = Math.sin(elapsedTime * 1.5) * 0.035

        monolithGroup.position.y = floatY
        monolithGroup.rotation.y = 0.38 + mouseX + Math.sin(elapsedTime * 0.5) * 0.04
        monolithGroup.rotation.x = 0.07 + mouseY

        // Pulsate emerald seam & ground glow subtly
        const pulse = Math.sin(elapsedTime * 2.8) * 0.12 + 0.88
        seamCoreMat.opacity = pulse
        seamGlowMat.opacity = pulse * 0.45
        groundMat.opacity = pulse * 0.95
        floorBounceLight.intensity = 2.4 + pulse * 0.8

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
        glowTexture.dispose()
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
        minHeight: '460px',
        maxHeight: '580px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  )
}
