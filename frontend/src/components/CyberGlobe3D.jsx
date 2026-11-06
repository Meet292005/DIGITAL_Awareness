import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberGlobe3D({ className = '', height = 360 }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let globeGroup, sphereMesh, wireMesh, ring1, ring2, nodesGroup
    let isDragging = false
    let previousMouseX = 0
    let previousMouseY = 0
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 380
      const h = height || 360

      camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 100)
      camera.position.z = 5.6

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x0e172a, 3)
      scene.add(ambientLight)

      const cyanLight = new THREE.PointLight(0x38bdf8, 4, 12)
      cyanLight.position.set(3, 3, 4)
      scene.add(cyanLight)

      const indigoLight = new THREE.PointLight(0x818cf8, 3.5, 12)
      indigoLight.position.set(-3, -2, 3)
      scene.add(indigoLight)

      const highlightLight = new THREE.PointLight(0x22d3ee, 2.5, 10)
      highlightLight.position.set(0, 4, -2)
      scene.add(highlightLight)

      globeGroup = new THREE.Group()
      scene.add(globeGroup)

      // 1. Core Sphere (Dark Translucent Glass)
      const sphereGeom = new THREE.SphereGeometry(1.75, 32, 32)
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0x070e1c,
        metalness: 0.85,
        roughness: 0.2,
        transmission: 0.35,
        thickness: 0.8,
        reflectivity: 0.9,
        clearcoat: 1.0,
      })
      sphereMesh = new THREE.Mesh(sphereGeom, sphereMat)
      globeGroup.add(sphereMesh)

      // 2. Cyber Wireframe Overlay
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
      wireMesh = new THREE.Mesh(sphereGeom, wireMat)
      wireMesh.scale.set(1.015, 1.015, 1.015)
      globeGroup.add(wireMesh)

      // 3. Orbital Defense Rings
      const ringGeom = new THREE.TorusGeometry(2.35, 0.02, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.6,
      })
      ring1 = new THREE.Mesh(ringGeom, ringMat)
      ring1.rotation.x = Math.PI / 3
      globeGroup.add(ring1)

      const ringGeom2 = new THREE.TorusGeometry(2.6, 0.015, 16, 100)
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.45,
      })
      ring2 = new THREE.Mesh(ringGeom2, ringMat2)
      ring2.rotation.y = Math.PI / 4
      ring2.rotation.x = Math.PI / 6
      globeGroup.add(ring2)

      // 4. Global Defense Nodes & Interconnects
      nodesGroup = new THREE.Group()
      globeGroup.add(nodesGroup)

      const nodeCount = 36
      const nodeCoords = []
      const nodeGeom = new THREE.SphereGeometry(0.045, 8, 8)
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee })

      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / nodeCount)
        const theta = Math.sqrt(nodeCount * Math.PI) * phi
        const r = 1.8

        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.sin(phi) * Math.sin(theta)
        const z = r * Math.cos(phi)

        nodeCoords.push(new THREE.Vector3(x, y, z))

        const node = new THREE.Mesh(nodeGeom, i % 3 === 0 ? pulseMat : nodeMat)
        node.position.set(x, y, z)
        nodesGroup.add(node)
      }

      // Connecting arcs between nearby nodes
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.22,
      })

      for (let i = 0; i < nodeCoords.length; i++) {
        for (let j = i + 1; j < nodeCoords.length; j++) {
          const dist = nodeCoords[i].distanceTo(nodeCoords[j])
          if (dist < 1.15) {
            const lineGeom = new THREE.BufferGeometry().setFromPoints([nodeCoords[i], nodeCoords[j]])
            const line = new THREE.Line(lineGeom, lineMat)
            nodesGroup.add(line)
          }
        }
      }

      // 5. Surrounding Atmosphere Particles
      const particleCount = 120
      const particleGeom = new THREE.BufferGeometry()
      const posArray = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const r = 2.4 + Math.random() * 1.2
        posArray[i] = r * Math.sin(phi) * Math.cos(theta)
        posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta)
        posArray[i + 2] = r * Math.cos(phi)
      }

      particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
      const particleMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
      })
      const particles = new THREE.Points(particleGeom, particleMat)
      globeGroup.add(particles)

      // Interactive Mouse Interaction
      const onMouseDown = (e) => {
        isDragging = true
        previousMouseX = e.clientX
        previousMouseY = e.clientY
      }

      const onMouseMove = (e) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMouseX
          const deltaY = e.clientY - previousMouseY
          targetRotationY += deltaX * 0.005
          targetRotationX += deltaY * 0.005
          previousMouseX = e.clientX
          previousMouseY = e.clientY
        } else {
          const rect = container.getBoundingClientRect()
          mouseX = ((e.clientX - rect.left) / width - 0.5) * 0.3
          mouseY = ((e.clientY - rect.top) / h - 0.5) * 0.3
        }
      }

      const onMouseUp = () => {
        isDragging = false
      }

      const dom = renderer.domElement
      dom.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)

      // Animation Loop
      let time = 0
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        time += 0.01

        // Constant gentle rotation + user interaction
        globeGroup.rotation.y += 0.003
        globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.1
        globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.1

        // Parallax damping when not dragging
        if (!isDragging) {
          globeGroup.rotation.y += mouseX * 0.02
          globeGroup.rotation.x += mouseY * 0.02
        }

        // Orbital ring rotations
        ring1.rotation.z += 0.005
        ring2.rotation.z -= 0.004

        // Floating particles breathing
        particles.rotation.y -= 0.002

        renderer.render(scene, camera)
      }
      animate()

      // Resize Observer
      const resizeObserver = new ResizeObserver(() => {
        if (!container) return
        const newWidth = container.clientWidth || 380
        const newHeight = height || 360
        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()
        renderer.setSize(newWidth, newHeight)
      })
      resizeObserver.observe(container)

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId)
        resizeObserver.disconnect()
        dom.removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        if (dom && dom.parentNode) dom.parentNode.removeChild(dom)
        renderer.dispose()
        sphereGeom.dispose()
        sphereMat.dispose()
        wireMat.dispose()
        ringGeom.dispose()
        ringMat.dispose()
        ringGeom2.dispose()
        ringMat2.dispose()
        nodeGeom.dispose()
        nodeMat.dispose()
        pulseMat.dispose()
        lineMat.dispose()
        particleGeom.dispose()
        particleMat.dispose()
      }
    } catch (e) {
      console.warn('WebGL initialization failed in CyberGlobe3D:', e)
      setHasWebGL(false)
    }
  }, [height])

  return (
    <div
      ref={containerRef}
      className={`cyber-globe-container ${className}`}
      style={{
        width: '100%',
        maxWidth: 420,
        height: height,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        cursor: 'grab',
      }}
      title="Click and drag to rotate global defense grid"
    >
      {!hasWebGL && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌐</div>
          <b>Global Defense Grid Active</b>
        </div>
      )}
    </div>
  )
}
