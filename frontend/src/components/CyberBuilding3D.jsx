import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const THREAT_FLOORS = [
  { floor: 8, name: 'AI Threat Recon & Satellite', code: 'SAT-LINK', color: 0x38bdf8, hex: '#38bdf8', icon: '📡' },
  { floor: 7, name: 'Cloud DDoS & Perimeter Shield', code: 'DDOS-DEF', color: 0x818cf8, hex: '#818cf8', icon: '🛡️' },
  { floor: 6, name: 'Phishing Detonation Chamber', code: 'PHISH-LAB', color: 0xf97316, hex: '#f97316', icon: '🎣' },
  { floor: 5, name: 'Zero-Trust Identity & Biometrics', code: 'BIO-MFA', color: 0xc084fc, hex: '#c084fc', icon: '👤' },
  { floor: 4, name: 'UPI & Payment Fraud Interceptor', code: 'UPI-GUARD', color: 0x00ff88, hex: '#00ff88', icon: '₹' },
  { floor: 3, name: 'Malware & Ransomware Quarantine', code: 'MAL-QUAR', color: 0xef4444, hex: '#ef4444', icon: '☣️' },
  { floor: 2, name: 'Passkey & Cryptographic Vault', code: 'KEY-VAULT', color: 0xfbbf24, hex: '#fbbf24', icon: '🔐' },
  { floor: 1, name: 'SOC Lobby & Incident Intake', code: 'SOC-HQ', color: 0x22d3ee, hex: '#22d3ee', icon: '🏢' },
]

export default function CyberBuilding3D({ className = '' }) {
  const containerRef = useRef(null)
  const [activeFloor, setActiveFloor] = useState(THREAT_FLOORS[4]) // default to UPI floor
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scene, camera, renderer, animationFrameId
    let cityGroup, towerGroup, roadCar, radarDish, elevatorPod
    let pedestrians = []
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    try {
      scene = new THREE.Scene()
      const width = container.clientWidth || 540
      const height = container.clientHeight || 560

      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
      camera.position.set(0, 1.2, 7.2)

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      container.appendChild(renderer.domElement)

      // ==========================================
      // STUDIO ATMOSPHERIC LIGHTING
      // ==========================================
      const ambientLight = new THREE.AmbientLight(0x182438, 2.4)
      scene.add(ambientLight)

      const keyLight = new THREE.DirectionalLight(0xe0eaff, 3.2)
      keyLight.position.set(4, 7, 5)
      scene.add(keyLight)

      const fillLight = new THREE.DirectionalLight(0x64748b, 1.6)
      fillLight.position.set(-5, 3, 3)
      scene.add(fillLight)

      const violetRim = new THREE.DirectionalLight(0x8b5cf6, 2.6)
      violetRim.position.set(-4, 5, -4)
      scene.add(violetRim)

      const streetGlowLight = new THREE.PointLight(0x00ff88, 2.5, 6)
      streetGlowLight.position.set(0, -1.5, 1.8)
      scene.add(streetGlowLight)

      // Master World Group
      cityGroup = new THREE.Group()
      scene.add(cityGroup)

      // ==========================================
      // GROUND, SIDEWALK & ROAD
      // ==========================================
      const groundGeo = new THREE.PlaneGeometry(16, 16)
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x0a0f1d,
        roughness: 0.8,
        metalness: 0.2,
      })
      const ground = new THREE.Mesh(groundGeo, groundMat)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -2.1
      cityGroup.add(ground)

      // Asphalt Road
      const roadGeo = new THREE.PlaneGeometry(14, 1.8)
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x080c16,
        roughness: 0.65,
        metalness: 0.35,
      })
      const road = new THREE.Mesh(roadGeo, roadMat)
      road.rotation.x = -Math.PI / 2
      road.position.set(0, -2.09, 1.8)
      cityGroup.add(road)

      // Road Dashed Centerline
      for (let i = -6; i <= 6; i += 1.2) {
        const dashGeo = new THREE.PlaneGeometry(0.6, 0.05)
        const dashMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 })
        const dash = new THREE.Mesh(dashGeo, dashMat)
        dash.rotation.x = -Math.PI / 2
        dash.position.set(i, -2.08, 1.8)
        cityGroup.add(dash)
      }

      // Concrete Sidewalk with neon curb edge
      const sidewalkGeo = new THREE.BoxGeometry(14, 0.08, 1.2)
      const sidewalkMat = new THREE.MeshStandardMaterial({
        color: 0x141d30,
        roughness: 0.5,
        metalness: 0.4,
      })
      const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat)
      sidewalk.position.set(0, -2.06, 0.4)
      cityGroup.add(sidewalk)

      // Sidewalk Glowing Curb Strip
      const curbGeo = new THREE.BoxGeometry(14, 0.02, 0.04)
      const curbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      const curb = new THREE.Mesh(curbGeo, curbMat)
      curb.position.set(0, -2.01, 0.98)
      cityGroup.add(curb)

      // Street Lamps along Sidewalk
      const lampPositions = [-3.8, 0, 3.8]
      lampPositions.forEach((lx) => {
        const poleGeo = new THREE.CylinderGeometry(0.025, 0.035, 1.2, 8)
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
        const pole = new THREE.Mesh(poleGeo, poleMat)
        pole.position.set(lx, -1.45, 0.85)
        cityGroup.add(pole)

        const headGeo = new THREE.BoxGeometry(0.18, 0.06, 0.12)
        const head = new THREE.Mesh(headGeo, poleMat)
        head.position.set(lx, -0.85, 0.85)
        cityGroup.add(head)

        const lightBulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        )
        lightBulb.position.set(lx, -0.89, 0.85)
        cityGroup.add(lightBulb)

        const lampLight = new THREE.PointLight(0x38bdf8, 1.2, 2.5)
        lampLight.position.set(lx, -0.92, 0.85)
        cityGroup.add(lampLight)
      })

      // ==========================================
      // ANIMATED AUTONOMOUS PATROL CAR
      // ==========================================
      const carGroup = new THREE.Group()
      const carBodyGeo = new THREE.BoxGeometry(0.85, 0.22, 0.42)
      const carBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      const carBody = new THREE.Mesh(carBodyGeo, carBodyMat)
      carGroup.add(carBody)

      const carCabinGeo = new THREE.BoxGeometry(0.45, 0.16, 0.36)
      const carCabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.15 })
      const carCabin = new THREE.Mesh(carCabinGeo, carCabinMat)
      carCabin.position.set(-0.06, 0.16, 0)
      carGroup.add(carCabin)

      // Headlights (Cyan/White)
      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), new THREE.MeshBasicMaterial({ color: 0xe0f2fe }))
      headL.position.set(0.43, 0, 0.12)
      const headR = headL.clone()
      headR.position.set(0.43, 0, -0.12)
      carGroup.add(headL)
      carGroup.add(headR)

      // Taillights (Red)
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.08), new THREE.MeshBasicMaterial({ color: 0xef4444 }))
      tailL.position.set(-0.43, 0, 0.12)
      const tailR = tailL.clone()
      tailR.position.set(-0.43, 0, -0.12)
      carGroup.add(tailL)
      carGroup.add(tailR)

      // Rooftop Lightbar (Emerald Security Pulse)
      const lightbar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.26), new THREE.MeshBasicMaterial({ color: 0x00ff88 }))
      lightbar.position.set(-0.06, 0.26, 0)
      carGroup.add(lightbar)

      carGroup.position.set(-5, -1.98, 1.8)
      cityGroup.add(carGroup)
      roadCar = carGroup

      // ==========================================
      // ANIMATED WALKING PEDESTRIANS (Cyber Citizens)
      // ==========================================
      const createPedestrian = (startX, startZ, speed, dir, clothColor) => {
        const ped = new THREE.Group()

        // Torso
        const torsoMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.6 })
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.26, 8), torsoMat)
        torso.position.y = 0.38
        ped.add(torso)

        // Head
        const headMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 })
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), headMat)
        head.position.y = 0.56
        ped.add(head)

        // Glowing Phone / Tablet in hand
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))
        phone.position.set(0.1, 0.34, 0.1)
        ped.add(phone)

        // Left Leg
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.26, 0.05), legMat)
        leftLeg.position.set(-0.04, 0.14, 0)
        ped.add(leftLeg)

        // Right Leg
        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.26, 0.05), legMat)
        rightLeg.position.set(0.04, 0.14, 0)
        ped.add(rightLeg)

        // Left Arm
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.04), torsoMat)
        leftArm.position.set(-0.1, 0.36, 0)
        ped.add(leftArm)

        // Right Arm
        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.04), torsoMat)
        rightArm.position.set(0.1, 0.36, 0)
        ped.add(rightArm)

        // Floating Shield Indicator above head
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.05, 0.07, 16),
          new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide })
        )
        halo.rotation.x = Math.PI / 2
        halo.position.y = 0.68
        ped.add(halo)

        ped.position.set(startX, -2.04, startZ)
        if (dir < 0) ped.rotation.y = Math.PI

        cityGroup.add(ped)
        return { group: ped, leftLeg, rightLeg, leftArm, rightArm, speed, dir }
      }

      pedestrians.push(createPedestrian(-2.5, 0.5, 0.016, 1, 0x0284c7)) // Blue hoodie
      pedestrians.push(createPedestrian(2.2, 0.32, 0.014, -1, 0x9333ea)) // Purple jacket
      pedestrians.push(createPedestrian(-0.8, 0.65, 0.018, 1, 0x059669)) // Emerald jacket

      // ==========================================
      // THE 8-STORY CYBER DEFENSE TOWER
      // ==========================================
      towerGroup = new THREE.Group()
      towerGroup.position.set(0, -2.0, -0.6)
      cityGroup.add(towerGroup)

      const floorHeight = 0.46
      const towerWidth = 2.0
      const towerDepth = 1.6

      // Building Foundation Plinth
      const plinthGeo = new THREE.BoxGeometry(towerWidth + 0.3, 0.14, towerDepth + 0.3)
      const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 })
      const plinth = new THREE.Mesh(plinthGeo, plinthMat)
      plinth.position.y = 0.07
      towerGroup.add(plinth)

      // Concrete Columns (4 corners)
      const columnPositions = [
        [-towerWidth / 2, -towerDepth / 2],
        [towerWidth / 2, -towerDepth / 2],
        [-towerWidth / 2, towerDepth / 2],
        [towerWidth / 2, towerDepth / 2],
      ]
      columnPositions.forEach(([cx, cz]) => {
        const colGeo = new THREE.BoxGeometry(0.08, floorHeight * 8 + 0.1, 0.08)
        const colMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
        const col = new THREE.Mesh(colGeo, colMat)
        col.position.set(cx, (floorHeight * 8) / 2 + 0.1, cz)
        towerGroup.add(col)
      })

      // Construct Each of the 8 Floors
      THREAT_FLOORS.forEach((tf, idx) => {
        const floorY = 0.14 + (tf.floor - 1) * floorHeight

        // Floor Slab Base (Gunmetal)
        const slabGeo = new THREE.BoxGeometry(towerWidth + 0.08, 0.06, towerDepth + 0.08)
        const slabMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.75,
          roughness: 0.3,
        })
        const slab = new THREE.Mesh(slabGeo, slabMat)
        slab.position.y = floorY + 0.03
        towerGroup.add(slab)

        // Floor Tinted Glass Facade
        const glassGeo = new THREE.BoxGeometry(towerWidth, floorHeight - 0.06, towerDepth)
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x09101f,
          roughness: 0.15,
          metalness: 0.9,
          transparent: true,
          opacity: 0.82,
        })
        const glass = new THREE.Mesh(glassGeo, glassMat)
        glass.position.y = floorY + floorHeight / 2
        towerGroup.add(glass)

        // Illuminated Threat Color Accent Strip around Floor Perimeter
        const stripGeo = new THREE.BoxGeometry(towerWidth + 0.02, 0.035, towerDepth + 0.02)
        const stripMat = new THREE.MeshBasicMaterial({
          color: tf.color,
          transparent: true,
          opacity: 0.9,
        })
        const strip = new THREE.Mesh(stripGeo, stripMat)
        strip.position.y = floorY + 0.06
        towerGroup.add(strip)

        // Internal Server Racks / Threat Core (Glow inside window)
        const coreGeo = new THREE.BoxGeometry(towerWidth * 0.75, floorHeight * 0.65, towerDepth * 0.75)
        const coreMat = new THREE.MeshBasicMaterial({
          color: tf.color,
          transparent: true,
          opacity: 0.22,
        })
        const core = new THREE.Mesh(coreGeo, coreMat)
        core.position.y = floorY + floorHeight / 2
        towerGroup.add(core)

        // Front Floor Label Light Plaque
        const plaqueGeo = new THREE.BoxGeometry(0.36, 0.08, 0.02)
        const plaqueMat = new THREE.MeshBasicMaterial({ color: tf.color })
        const plaque = new THREE.Mesh(plaqueGeo, plaqueMat)
        plaque.position.set(-towerWidth * 0.32, floorY + floorHeight * 0.75, towerDepth / 2 + 0.015)
        towerGroup.add(plaque)

        // Floor Interior Light
        const floorLight = new THREE.PointLight(tf.color, 0.9, 1.8)
        floorLight.position.set(0, floorY + floorHeight / 2, 0)
        towerGroup.add(floorLight)
      })

      // Ground Floor Entrance (Glass Double Doors & Reception)
      const lobbyEntranceGeo = new THREE.BoxGeometry(0.65, 0.35, 0.04)
      const lobbyEntranceMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.95 })
      const lobbyEntrance = new THREE.Mesh(lobbyEntranceGeo, lobbyEntranceMat)
      lobbyEntrance.position.set(0, 0.3, towerDepth / 2 + 0.02)
      towerGroup.add(lobbyEntrance)

      // External Glass Elevator Shaft on Left Side
      const elevatorShaftGeo = new THREE.BoxGeometry(0.24, floorHeight * 8 + 0.1, 0.24)
      const elevatorShaftMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
      })
      const elevatorShaft = new THREE.Mesh(elevatorShaftGeo, elevatorShaftMat)
      elevatorShaft.position.set(-towerWidth / 2 - 0.16, (floorHeight * 8) / 2 + 0.1, 0)
      towerGroup.add(elevatorShaft)

      // Animated Elevator Pod
      const podGeo = new THREE.BoxGeometry(0.18, 0.25, 0.18)
      const podMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 })
      elevatorPod = new THREE.Mesh(podGeo, podMat)
      elevatorPod.position.set(-towerWidth / 2 - 0.16, 0.5, 0)
      towerGroup.add(elevatorPod)

      // ==========================================
      // ROOFTOP: HELIPAD, SATELLITE RADAR & BEACONS
      // ==========================================
      const roofY = 0.14 + 8 * floorHeight

      // Roof Plinth & Helipad
      const roofPlinth = new THREE.Mesh(
        new THREE.BoxGeometry(towerWidth * 0.9, 0.1, towerDepth * 0.9),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      )
      roofPlinth.position.y = roofY + 0.05
      towerGroup.add(roofPlinth)

      // Helipad Ring
      const heliRing = new THREE.Mesh(
        new THREE.RingGeometry(0.35, 0.42, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      )
      heliRing.rotation.x = -Math.PI / 2
      heliRing.position.set(0.3, roofY + 0.11, 0)
      towerGroup.add(heliRing)

      // Communication Spire
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
      )
      spire.position.set(-0.45, roofY + 0.55, 0)
      towerGroup.add(spire)

      // Blinking Aircraft Warning Beacon
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      )
      beacon.position.set(-0.45, roofY + 1.02, 0)
      towerGroup.add(beacon)

      // Rotating Radar Dish
      const dishGroup = new THREE.Group()
      const dishBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.04, 0.18, 8),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      )
      dishGroup.add(dishBase)

      const dishBowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, metalness: 0.8, roughness: 0.2 })
      )
      dishBowl.rotation.x = Math.PI / 3
      dishBowl.position.y = 0.14
      dishGroup.add(dishBowl)

      dishGroup.position.set(0.3, roofY + 0.2, 0)
      towerGroup.add(dishGroup)
      radarDish = dishGroup

      // Initial orientation & mouse tracking
      cityGroup.rotation.y = 0.42
      cityGroup.rotation.x = 0.12

      const onMouseMove = (event) => {
        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        targetX = (x / rect.width) * 0.45
        targetY = (y / rect.height) * 0.25
      }

      window.addEventListener('mousemove', onMouseMove)

      const onResize = () => {
        if (!container) return
        const w = container.clientWidth || 540
        const h = container.clientHeight || 560
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

        // Smooth camera parallax
        mouseX += (targetX - mouseX) * 0.05
        mouseY += (targetY - mouseY) * 0.05
        cityGroup.rotation.y = 0.42 + mouseX
        cityGroup.rotation.x = 0.12 + mouseY

        // Rotate Satellite Radar Dish
        if (radarDish) {
          radarDish.rotation.y = elapsedTime * 1.5
        }

        // Animate Elevator Pod traveling between floors
        if (elevatorPod) {
          const elevY = 0.4 + (Math.sin(elapsedTime * 0.8) * 0.5 + 0.5) * (floorHeight * 7)
          elevatorPod.position.y = elevY
        }

        // Animate Autonomous Patrol Car driving on Road
        if (roadCar) {
          roadCar.position.x += 0.04
          if (roadCar.position.x > 7) {
            roadCar.position.x = -7
          }
        }

        // Animate Walking Pedestrians (Legs & Arms swinging realistically)
        pedestrians.forEach((p, i) => {
          p.group.position.x += p.speed * p.dir

          // Loop around sidewalk borders
          if (p.dir > 0 && p.group.position.x > 6) {
            p.group.position.x = -6
          } else if (p.dir < 0 && p.group.position.x < -6) {
            p.group.position.x = 6
          }

          // Natural Leg & Arm Swing Walk Cycle
          const walkCycle = Math.sin(elapsedTime * 8 + i * 2) * 0.45
          p.leftLeg.rotation.x = walkCycle
          p.rightLeg.rotation.x = -walkCycle
          p.leftArm.rotation.x = -walkCycle * 0.8
          p.rightArm.rotation.x = walkCycle * 0.8
        })

        // Beacon blink
        if (beacon) {
          beacon.material.opacity = Math.sin(elapsedTime * 4) > 0 ? 1 : 0.2
        }

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
      <div className={`building-fallback ${className}`}>
        <div className="building-fallback-card">
          <h4>Cyber Defense Tower</h4>
          <p>8-Floor Live Incident & Telemetry Center</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`cyber-building-wrapper ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '480px',
          maxHeight: '620px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* Interactive Floor Telemetry Pill Overlay */}
      <div
        className="building-threat-overlay"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          background: 'rgba(10, 15, 28, 0.88)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${activeFloor.hex}`,
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${activeFloor.hex}22`,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{activeFloor.icon}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: activeFloor.hex,
                  background: `${activeFloor.hex}18`,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                FLOOR 0{activeFloor.floor} // {activeFloor.code}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>• LIVE OPS</span>
            </div>
            <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block', marginTop: '2px' }}>
              {activeFloor.name}
            </strong>
          </div>
        </div>

        {/* Floor selector dots */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {THREAT_FLOORS.map((f) => (
            <button
              key={f.floor}
              type="button"
              onClick={() => setActiveFloor(f)}
              title={`Floor ${f.floor}: ${f.name}`}
              style={{
                width: '8px',
                height: activeFloor.floor === f.floor ? '20px' : '10px',
                borderRadius: '99px',
                background: activeFloor.floor === f.floor ? f.hex : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
