import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberTrophy3D({ className = '', height = 240 }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let trophyGroup, haloRing, particles

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 240
      const h = height || 240

      camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 100)
      camera.position.z = 4.8

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // Lighting
      const ambient = new THREE.AmbientLight(0x0e172a, 3.5)
      scene.add(ambient)

      const cyanPoint = new THREE.PointLight(0x38bdf8, 4, 8)
      cyanPoint.position.set(2, 2, 2)
      scene.add(cyanPoint)

      const goldPoint = new THREE.PointLight(0xf59e0b, 2.5, 8)
      goldPoint.position.set(-2, -1, 2)
      scene.add(goldPoint)

      trophyGroup = new THREE.Group()
      scene.add(trophyGroup)

      // 1. Cyber Diamond / Star Trophy Core
      const diamondGeom = new THREE.OctahedronGeometry(1.15, 0)
      const diamondMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.1,
        transmission: 0.4,
        reflectivity: 1.0,
        clearcoat: 1.0,
      })
      const diamondMesh = new THREE.Mesh(diamondGeom, diamondMat)
      trophyGroup.add(diamondMesh)

      // Wireframe overlay
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.7 })
      const wireMesh = new THREE.Mesh(diamondGeom, wireMat)
      wireMesh.scale.set(1.04, 1.04, 1.04)
      trophyGroup.add(wireMesh)

      // Inner Core Glow Sphere
      const coreGeom = new THREE.IcosahedronGeometry(0.45, 0)
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true })
      const coreMesh = new THREE.Mesh(coreGeom, coreMat)
      trophyGroup.add(coreMesh)

      // 2. Base Pedestal Ring
      const ringGeom = new THREE.TorusGeometry(1.6, 0.015, 16, 60)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.6 })
      haloRing = new THREE.Mesh(ringGeom, ringMat)
      haloRing.rotation.x = Math.PI / 2.3
      scene.add(haloRing)

      // 3. Floating particle sparks
      const count = 40
      const pGeom = new THREE.BufferGeometry()
      const pPos = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 3
        pPos[i + 1] = (Math.random() - 0.5) * 3
        pPos[i + 2] = (Math.random() - 0.5) * 2
      }
      pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x38bdf8, transparent: true, opacity: 0.8 })
      particles = new THREE.Points(pGeom, pMat)
      scene.add(particles)

      const clock = new THREE.Clock()
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        trophyGroup.rotation.y = t * 0.8
        trophyGroup.rotation.x = Math.sin(t * 0.6) * 0.15
        trophyGroup.position.y = Math.sin(t * 1.5) * 0.08
        haloRing.rotation.z = -t * 0.3
        particles.rotation.y = t * 0.1
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        diamondGeom.dispose()
        diamondMat.dispose()
        wireMat.dispose()
        coreGeom.dispose()
        coreMat.dispose()
        ringGeom.dispose()
        ringMat.dispose()
        pGeom.dispose()
        pMat.dispose()
        renderer.dispose()
      }
    } catch {
      setHasWebGL(false)
    }
  }, [height])

  return (
    <div className={`cyber-trophy-container ${className}`} ref={containerRef} style={{ width: '100%', height, position: 'relative' }}>
      {!hasWebGL && <div className="fallback-trophy-icon">🏆</div>}
    </div>
  )
}
