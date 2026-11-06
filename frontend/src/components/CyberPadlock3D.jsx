import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberPadlock3D({ className = '', height = 280 }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let lockGroup, ring1, ring2

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 280
      const h = height || 280

      camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100)
      camera.position.z = 5.2

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // Lights
      const ambientLight = new THREE.AmbientLight(0x0e1726, 3)
      scene.add(ambientLight)

      const cyanLight = new THREE.PointLight(0x38bdf8, 3.5, 10)
      cyanLight.position.set(2, 2, 3)
      scene.add(cyanLight)

      const purpleLight = new THREE.PointLight(0x818cf8, 3, 10)
      purpleLight.position.set(-2, -2, 2)
      scene.add(purpleLight)

      lockGroup = new THREE.Group()
      scene.add(lockGroup)

      // 1. Lock Body (Rounded Box)
      const bodyGeom = new THREE.BoxGeometry(1.6, 1.3, 0.5)
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 0.8,
        reflectivity: 0.9,
      })
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat)
      bodyMesh.position.y = -0.4
      lockGroup.add(bodyMesh)

      // Body wireframe overlay
      const bodyWireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.4 })
      const bodyWireMesh = new THREE.Mesh(bodyGeom, bodyWireMat)
      bodyWireMesh.position.y = -0.4
      bodyWireMesh.scale.set(1.02, 1.02, 1.02)
      lockGroup.add(bodyWireMesh)

      // 2. Lock Shackle (Torus Arc)
      const shackleGeom = new THREE.TorusGeometry(0.55, 0.12, 16, 40, Math.PI)
      const shackleMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3,
      })
      const shackleMesh = new THREE.Mesh(shackleGeom, shackleMat)
      shackleMesh.position.y = 0.25
      lockGroup.add(shackleMesh)

      // 3. Keyhole Cylinder
      const keyholeGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.52, 16)
      const keyholeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      const keyhole = new THREE.Mesh(keyholeGeom, keyholeMat)
      keyhole.rotation.x = Math.PI / 2
      keyhole.position.set(0, -0.4, 0.05)
      lockGroup.add(keyhole)

      // 4. Orbiting Data Halo Rings
      const ringGeom = new THREE.TorusGeometry(1.5, 0.012, 16, 60)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 })
      ring1 = new THREE.Mesh(ringGeom, ringMat)
      ring1.rotation.x = Math.PI / 3
      scene.add(ring1)

      const ring2Geom = new THREE.TorusGeometry(1.2, 0.01, 16, 50)
      const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 })
      ring2 = new THREE.Mesh(ring2Geom, ring2Mat)
      ring2.rotation.y = Math.PI / 4
      scene.add(ring2)

      const clock = new THREE.Clock()
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        lockGroup.rotation.y = Math.sin(t * 0.8) * 0.35
        lockGroup.position.y = Math.sin(t * 1.5) * 0.1
        ring1.rotation.z = t * 0.2
        ring2.rotation.x = -t * 0.25
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        bodyGeom.dispose()
        bodyMat.dispose()
        bodyWireMat.dispose()
        shackleGeom.dispose()
        shackleMat.dispose()
        keyholeGeom.dispose()
        keyholeMat.dispose()
        ringGeom.dispose()
        ringMat.dispose()
        ring2Geom.dispose()
        ring2Mat.dispose()
        renderer.dispose()
      }
    } catch {
      setHasWebGL(false)
    }
  }, [height])

  return (
    <div className={`cyber-padlock-container ${className}`} ref={containerRef} style={{ width: '100%', height, position: 'relative' }}>
      {!hasWebGL && <div className="fallback-lock-icon">🔒</div>}
    </div>
  )
}
