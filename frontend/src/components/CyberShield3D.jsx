import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function CyberShield3D({ className = '' }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let shieldGroup, particles, outerRing, innerRing, floatingNodes = []
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 450
      const height = container.clientHeight || 450

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.z = 6.2

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      container.appendChild(renderer.domElement)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x0f1c30, 2.5)
      scene.add(ambientLight)

      const cyanPoint = new THREE.PointLight(0x38bdf8, 4, 15)
      cyanPoint.position.set(3, 3, 4)
      scene.add(cyanPoint)

      const indigoPoint = new THREE.PointLight(0x818cf8, 3.5, 15)
      indigoPoint.position.set(-3, -2, 3)
      scene.add(indigoPoint)

      const blueRim = new THREE.DirectionalLight(0x22d3ee, 2)
      blueRim.position.set(0, 5, -2)
      scene.add(blueRim)

      // Shield Model Group
      shieldGroup = new THREE.Group()
      scene.add(shieldGroup)

      // 1. Procedural 3D Shield Shape
      const shieldShape = new THREE.Shape()
      shieldShape.moveTo(0, 1.7)
      shieldShape.bezierCurveTo(0.8, 1.7, 1.4, 1.3, 1.4, 0.6)
      shieldShape.bezierCurveTo(1.4, -0.4, 0.7, -1.3, 0, -1.8)
      shieldShape.bezierCurveTo(-0.7, -1.3, -1.4, -0.4, -1.4, 0.6)
      shieldShape.bezierCurveTo(-1.4, 1.3, -0.8, 1.7, 0, 1.7)

      const extrudeSettings = {
        depth: 0.28,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.08,
      }

      const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings)
      shieldGeometry.center()

      // Materials
      const shieldMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0c1a2e,
        metalness: 0.85,
        roughness: 0.15,
        transmission: 0.35,
        thickness: 0.5,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      })
      const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial)
      shieldGroup.add(shieldMesh)

      // Wireframe overlay for cyber look
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      })
      const wireframeMesh = new THREE.Mesh(shieldGeometry, wireframeMaterial)
      wireframeMesh.scale.set(1.02, 1.02, 1.02)
      shieldGroup.add(wireframeMesh)

      // Inner Glowing Crest / Core
      const coreShape = new THREE.Shape()
      coreShape.moveTo(0, 0.9)
      coreShape.lineTo(0.7, 0.2)
      coreShape.lineTo(0.4, -0.7)
      coreShape.lineTo(0, -1.0)
      coreShape.lineTo(-0.4, -0.7)
      coreShape.lineTo(-0.7, 0.2)
      coreShape.closePath()

      const coreGeometry = new THREE.ShapeGeometry(coreShape)
      coreGeometry.center()
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      })
      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
      coreMesh.position.z = 0.24
      shieldGroup.add(coreMesh)

      // 2. Orbital Rings
      const ringGeom = new THREE.TorusGeometry(2.35, 0.015, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
      outerRing = new THREE.Mesh(ringGeom, ringMat)
      outerRing.rotation.x = Math.PI / 3.2
      outerRing.rotation.y = Math.PI / 6
      scene.add(outerRing)

      const innerRingGeom = new THREE.TorusGeometry(1.9, 0.012, 16, 80)
      const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 })
      innerRing = new THREE.Mesh(innerRingGeom, innerRingMat)
      innerRing.rotation.x = -Math.PI / 4
      innerRing.rotation.y = -Math.PI / 5
      scene.add(innerRing)

      // 3. Floating Encrypted Data Polyhedra
      const nodeGeometries = [
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.IcosahedronGeometry(0.16, 0),
        new THREE.TetrahedronGeometry(0.19, 0),
      ]
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.8,
        wireframe: true,
      })

      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(nodeGeometries[i % nodeGeometries.length], nodeMaterial)
        const angle = (i / 6) * Math.PI * 2
        const radius = 2.4 + (i % 2) * 0.4
        mesh.position.set(Math.cos(angle) * radius, (Math.sin(i * 1.5) * 0.9), Math.sin(angle) * radius * 0.6)
        scene.add(mesh)
        floatingNodes.push({ mesh, angle, speed: 0.008 + (i % 3) * 0.003, radius, yBase: mesh.position.y })
      }

      // 4. Background Particle Matrix
      const particleCount = 180
      const particleGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      const c1 = new THREE.Color(0x38bdf8)
      const c2 = new THREE.Color(0x818cf8)

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 11
        positions[i + 1] = (Math.random() - 0.5) * 9
        positions[i + 2] = (Math.random() - 0.5) * 6

        const mixColor = Math.random() > 0.5 ? c1 : c2
        colors[i] = mixColor.r
        colors[i + 1] = mixColor.g
        colors[i + 2] = mixColor.b
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
      })
      particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      // Mouse listener for parallax
      const onMouseMove = (event) => {
        const rect = container.getBoundingClientRect()
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      }
      window.addEventListener('mousemove', onMouseMove)

      // Resize observer
      const onResize = () => {
        if (!container) return
        const w = container.clientWidth || 450
        const h = container.clientHeight || 450
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      const resizeObserver = new ResizeObserver(onResize)
      resizeObserver.observe(container)

      // Animation loop
      let clock = new THREE.Clock()
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const elapsedTime = clock.getElapsedTime()

        // Smooth mouse dampening
        targetX += (mouseX - targetX) * 0.05
        targetY += (mouseY - targetY) * 0.05

        // Shield animation
        if (shieldGroup) {
          shieldGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.18 + targetX * 0.45
          shieldGroup.rotation.x = Math.cos(elapsedTime * 0.5) * 0.1 - targetY * 0.35
          shieldGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12
        }

        // Rings animation
        if (outerRing) {
          outerRing.rotation.z = elapsedTime * 0.15
          outerRing.rotation.x = Math.PI / 3.2 + Math.sin(elapsedTime * 0.3) * 0.1
        }
        if (innerRing) {
          innerRing.rotation.z = -elapsedTime * 0.22
          innerRing.rotation.y = -Math.PI / 5 + Math.cos(elapsedTime * 0.4) * 0.1
        }

        // Floating nodes
        floatingNodes.forEach((node) => {
          node.angle += node.speed
          node.mesh.position.x = Math.cos(node.angle) * node.radius
          node.mesh.position.z = Math.sin(node.angle) * (node.radius * 0.6)
          node.mesh.position.y = node.yBase + Math.sin(elapsedTime * 2 + node.angle) * 0.2
          node.mesh.rotation.x += 0.02
          node.mesh.rotation.y += 0.03
        })

        // Particles gentle drift
        if (particles) {
          particles.rotation.y = elapsedTime * 0.03
        }

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        resizeObserver.disconnect()
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
        shieldGeometry.dispose()
        shieldMaterial.dispose()
        wireframeMaterial.dispose()
        coreGeometry.dispose()
        coreMaterial.dispose()
        ringGeom.dispose()
        ringMat.dispose()
        innerRingGeom.dispose()
        innerRingMat.dispose()
        nodeGeometries.forEach((g) => g.dispose())
        nodeMaterial.dispose()
        particleGeometry.dispose()
        particleMaterial.dispose()
        renderer.dispose()
      }
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to CSS illustration', e)
      setHasWebGL(false)
    }
  }, [])

  return (
    <div className={`cyber-shield-container ${className}`} ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!hasWebGL && (
        <div className="cyber-fallback-shield">
          <div className="shield-core-fallback" />
        </div>
      )}
    </div>
  )
}
