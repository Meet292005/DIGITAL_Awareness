import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberScanner3D({ className = '', height = 220 }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let scannerGroup, coreMesh, radarBeams = [], rings = []

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 300
      const h = height || 220

      camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100)
      camera.position.set(0, 1.8, 3.8)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // Lighting
      const ambient = new THREE.AmbientLight(0x0e172a, 3)
      scene.add(ambient)

      const cyanLight = new THREE.PointLight(0x38bdf8, 4, 10)
      cyanLight.position.set(2, 3, 2)
      scene.add(cyanLight)

      const highlight = new THREE.PointLight(0x22d3ee, 3, 10)
      highlightLightPosition: highlight.position.set(-2, 1, -2)
      scene.add(highlight)

      scannerGroup = new THREE.Group()
      scene.add(scannerGroup)

      // 1. Concentric Holographic Radar Rings
      const ringRadii = [0.8, 1.35, 1.9]
      ringRadii.forEach((r, idx) => {
        const ringGeom = new THREE.RingGeometry(r - 0.015, r + 0.015, 64)
        const ringMat = new THREE.MeshBasicMaterial({
          color: idx === 1 ? 0x22d3ee : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35 + idx * 0.15,
        })
        const ring = new THREE.Mesh(ringGeom, ringMat)
        ring.rotation.x = Math.PI / 2
        scannerGroup.add(ring)
        rings.push(ring)
      })

      // 2. Crosshair grid lines
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 })
      const lineGeom1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.1, 0, 0),
        new THREE.Vector3(2.1, 0, 0),
      ])
      const lineGeom2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -2.1),
        new THREE.Vector3(0, 0, 2.1),
      ])
      scannerGroup.add(new THREE.Line(lineGeom1, lineMat))
      scannerGroup.add(new THREE.Line(lineGeom2, lineMat))

      // 3. Central Encrypted Hologram Core
      const coreGeom = new THREE.OctahedronGeometry(0.38, 0)
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
      })
      coreMesh = new THREE.Mesh(coreGeom, coreMat)
      coreMesh.position.y = 0.3
      scannerGroup.add(coreMesh)

      // Core wireframe
      const coreWireMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.8 })
      const coreWire = new THREE.Mesh(coreGeom, coreWireMat)
      coreWire.position.y = 0.3
      coreWire.scale.set(1.08, 1.08, 1.08)
      scannerGroup.add(coreWire)

      // 4. Rotating Radar Sweep Beam (Pie sector)
      const sweepGeom = new THREE.CircleGeometry(1.9, 32, 0, Math.PI / 3)
      const sweepMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      })
      const sweepMesh = new THREE.Mesh(sweepGeom, sweepMat)
      sweepMesh.rotation.x = Math.PI / 2
      scannerGroup.add(sweepMesh)

      // 5. Orbiting threat / clue blips
      const blipGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08)
      const blipMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e })
      const blip1 = new THREE.Mesh(blipGeom, blipMat)
      blip1.position.set(0.9, 0.05, -0.6)
      scannerGroup.add(blip1)

      const blipMat2 = new THREE.MeshBasicMaterial({ color: 0x34d399 })
      const blip2 = new THREE.Mesh(blipGeom, blipMat2)
      blip2.position.set(-1.1, 0.05, 0.8)
      scannerGroup.add(blip2)

      // Animation Loop
      let time = 0
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        time += 0.02

        // Rotate sweep beam
        sweepMesh.rotation.z += 0.025

        // Hover core
        coreMesh.rotation.y += 0.015
        coreMesh.rotation.x += 0.008
        coreWire.rotation.y += 0.015
        coreWire.rotation.x += 0.008
        coreMesh.position.y = 0.3 + Math.sin(time * 2) * 0.05
        coreWire.position.y = coreMesh.position.y

        // Blip pulse
        const s = 1 + Math.sin(time * 4) * 0.3
        blip1.scale.set(s, s, s)
        blip2.scale.set(s, s, s)

        // Gentle scanner tilt
        scannerGroup.rotation.y = Math.sin(time * 0.5) * 0.15

        renderer.render(scene, camera)
      }
      animate()

      // Resize
      const resizeObserver = new ResizeObserver(() => {
        if (!container) return
        const newWidth = container.clientWidth || 300
        const newHeight = height || 220
        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()
        renderer.setSize(newWidth, newHeight)
      })
      resizeObserver.observe(container)

      return () => {
        cancelAnimationFrame(animationFrameId)
        resizeObserver.disconnect()
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        renderer.dispose()
        coreGeom.dispose()
        coreMat.dispose()
        coreWireMat.dispose()
        sweepGeom.dispose()
        sweepMat.dispose()
        blipGeom.dispose()
        blipMat.dispose()
        blipMat2.dispose()
        lineMat.dispose()
        lineGeom1.dispose()
        lineGeom2.dispose()
      }
    } catch (e) {
      console.warn('WebGL init failed in CyberScanner3D:', e)
      setHasWebGL(false)
    }
  }, [height])

  return (
    <div
      ref={containerRef}
      className={`cyber-scanner-container ${className}`}
      style={{
        width: '100%',
        maxWidth: 320,
        height: height,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {!hasWebGL && (
        <div style={{ color: 'var(--highlight)', fontSize: 13, textAlign: 'center' }}>
          🛡️ Tactical Mission Radar Active
        </div>
      )}
    </div>
  )
}
