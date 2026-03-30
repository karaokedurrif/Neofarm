'use client'
import React, { useRef, useState, useMemo, useEffect, memo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════
   CONFIG — 1000 vine plants across 25 rows × 40 vines
   ═══════════════════════════════════════════════════════ */
const ROWS = 25
const VINES_PER_ROW = 40
const ROW_SPACING = 2.0
const VINE_SPACING = 0.55
const TOTAL_VINES = ROWS * VINES_PER_ROW
const POSTS_PER_ROW = 9
const ROW_LENGTH = VINES_PER_ROW * VINE_SPACING
const TOTAL_POSTS = ROWS * POSTS_PER_ROW
const LEAF_INSTANCES = TOTAL_VINES * 3

function sr(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

interface VineRowsProps {
  ndviValues: number[]
  humidityValues: number[]
}

/* ═══════════════════════════════════════════════════════
   PROCEDURAL TEXTURES — stone, soil normal, leaf alpha
   ═══════════════════════════════════════════════════════ */

/** Simple 2D hash for procedural noise */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** Value noise with bilinear interpolation */
function valueNoise(px: number, py: number) {
  const ix = Math.floor(px), iy = Math.floor(py)
  const fx = px - ix, fy = py - iy
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy), b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

/** Multi-octave fractal noise */
function fbm(x: number, y: number, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq)
    amp *= 0.5; freq *= 2
  }
  return val
}

/** Create a stone/brick DataTexture for the winery building */
function createStoneTexture(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const bx = Math.floor(x / 32), by = Math.floor(y / 24)
      const offsetRow = (by % 2 === 0) ? 0 : 16
      const localX = (x + offsetRow) % 32, localY = y % 24
      const isMortar = localX < 1 || localY < 1
      const n = fbm(x * 0.05, y * 0.05, 3)
      const blockNoise = hash(bx + offsetRow, by)
      if (isMortar) {
        data[i] = 100; data[i + 1] = 90; data[i + 2] = 78; data[i + 3] = 255
      } else {
        const base = 120 + blockNoise * 50 + n * 30
        data[i] = Math.min(255, base * 0.85)
        data[i + 1] = Math.min(255, base * 0.78)
        data[i + 2] = Math.min(255, base * 0.65)
        data[i + 3] = 255
      }
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 3)
  tex.needsUpdate = true
  return tex
}

/** Create a stone displacement map (height per-texel for stone relief) */
function createStoneDisplacementMap(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const bx = Math.floor(x / 32), by = Math.floor(y / 24)
      const offsetRow = (by % 2 === 0) ? 0 : 16
      const localX = (x + offsetRow) % 32, localY = y % 24
      const isMortar = localX < 1 || localY < 1
      // Mortar is recessed, stones protrude with noise variation
      const stoneHeight = isMortar ? 0 : 80 + hash(bx + offsetRow, by) * 80 + fbm(x * 0.1, y * 0.1, 2) * 40
      const v = Math.min(255, Math.max(0, stoneHeight))
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 3)
  tex.needsUpdate = true
  return tex
}

/** Create a soil normal map for terrain */
function createSoilNormalMap(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Height from multi-octave noise
      const scale = 0.08
      const hL = fbm((x - 1) * scale, y * scale, 4)
      const hR = fbm((x + 1) * scale, y * scale, 4)
      const hD = fbm(x * scale, (y - 1) * scale, 4)
      const hU = fbm(x * scale, (y + 1) * scale, 4)
      // Normal via central differences
      const dx = (hR - hL) * 3.0
      const dy = (hU - hD) * 3.0
      data[i] = Math.min(255, Math.max(0, (dx * 0.5 + 0.5) * 255))
      data[i + 1] = Math.min(255, Math.max(0, (dy * 0.5 + 0.5) * 255))
      data[i + 2] = 200  // Z component (mostly up)
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(10, 10)
  tex.needsUpdate = true
  return tex
}

/** Create a leaf texture with alpha channel for transparency */
function createLeafTexture(w = 64, h = 64): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  const cx = w / 2, cy = h / 2
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Leaf shape: elongated ellipse with pointed tip
      const nx = (x - cx) / cx, ny = (y - cy) / cy
      // Heart-ish leaf shape
      const dist = Math.sqrt(nx * nx * 0.8 + ny * ny * 1.3)
      // Serrated edge via sin modulation
      const angle = Math.atan2(ny, nx)
      const serration = 1 + Math.sin(angle * 7) * 0.08 + Math.sin(angle * 13) * 0.04
      const leafMask = dist < 0.75 * serration ? 1 : 0
      // Vein structure
      const mainVein = Math.abs(nx) < 0.03 ? 0.7 : 1
      const sideVein = Math.abs(Math.sin(ny * 8 + nx * 3)) < 0.08 ? 0.85 : 1
      const veinFactor = mainVein * sideVein
      // Green color with noise variation
      const n = fbm(x * 0.15, y * 0.15, 2)
      const green = (0.55 + n * 0.15) * veinFactor
      data[i] = Math.min(255, green * 120)           // R
      data[i + 1] = Math.min(255, green * 220)       // G
      data[i + 2] = Math.min(255, green * 70)        // B
      data[i + 3] = leafMask * 255                    // Alpha
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.needsUpdate = true
  return tex
}

/* ═══════════════════════════════════════════════════════
   TERRAIN — displaced with vertex colors (earth/grass)
   ═══════════════════════════════════════════════════════ */
function Terrain() {
  const ref = useRef<THREE.Mesh>(null)
  const normalMap = useMemo(() => createSoilNormalMap(), [])
  const bumpMap = useMemo(() => {
    // Reuse noise as a bump texture for micro-relief
    const w = 256, h = 256
    const data = new Uint8Array(w * h * 4)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const v = Math.min(255, fbm(x * 0.12, y * 0.12, 4) * 255)
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255
      }
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(12, 12)
    tex.needsUpdate = true
    return tex
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const geo = ref.current.geometry
    const pos = geo.attributes.position as THREE.BufferAttribute
    // Vertex colors: earth with grass patches
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      // Multi-octave displacement
      const h =
        Math.sin(x * 0.08) * Math.cos(y * 0.06) * 0.8 +
        Math.sin(x * 0.25 + 1.7) * Math.cos(y * 0.22 + 0.9) * 0.3 +
        Math.sin(x * 0.6 + 3.1) * Math.cos(y * 0.55 + 2.4) * 0.1 +
        fbm(x * 0.3, y * 0.3, 3) * 0.15
      pos.setZ(i, h)
      // Color noise: blend dry earth, wet earth, grass patches
      const n1 = fbm(x * 0.06 + 100, y * 0.06 + 200, 3)  // large patches
      const n2 = fbm(x * 0.2 + 50, y * 0.2 + 80, 2)       // detail
      const grassMask = n1 > 0.55 ? (n1 - 0.55) * 4 : 0    // 0-1 grass blend
      const wetMask = n2 < 0.3 ? (0.3 - n2) * 2 : 0        // darker wet patches
      // Base dry earth
      let r = 0.29, g = 0.22, b = 0.16
      // Blend grass (olive green)
      r += grassMask * (-0.12 + n2 * 0.04)
      g += grassMask * (0.12 + n2 * 0.05)
      b += grassMask * (-0.04)
      // Darker wet patches
      r -= wetMask * 0.06
      g -= wetMask * 0.04
      b -= wetMask * 0.02
      colors[i * 3] = Math.max(0, Math.min(1, r))
      colors[i * 3 + 1] = Math.max(0, Math.min(1, g))
      colors[i * 3 + 2] = Math.max(0, Math.min(1, b))
    }
    pos.needsUpdate = true
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
  }, [])

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 160, 160]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.96}
        metalness={0}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1.0, 1.0)}
        bumpMap={bumpMap}
        bumpScale={0.15}
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════
   LEAF GEOMETRY — vine leaf silhouette (ShapeGeometry)
   ═══════════════════════════════════════════════════════ */
function createLeafGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.04, 0.06, 0.1, 0.1, 0.12, 0.08)
  shape.bezierCurveTo(0.14, 0.06, 0.13, 0.12, 0.09, 0.14)
  shape.bezierCurveTo(0.12, 0.16, 0.15, 0.13, 0.14, 0.1)
  shape.bezierCurveTo(0.16, 0.12, 0.14, 0.18, 0.08, 0.18)
  shape.bezierCurveTo(0.06, 0.2, 0.04, 0.18, 0.0, 0.16)
  shape.bezierCurveTo(-0.04, 0.18, -0.06, 0.2, -0.08, 0.18)
  shape.bezierCurveTo(-0.14, 0.18, -0.16, 0.12, -0.14, 0.1)
  shape.bezierCurveTo(-0.15, 0.13, -0.12, 0.16, -0.09, 0.14)
  shape.bezierCurveTo(-0.13, 0.12, -0.14, 0.06, -0.12, 0.08)
  shape.bezierCurveTo(-0.1, 0.1, -0.04, 0.06, 0, 0)
  const geo = new THREE.ShapeGeometry(shape, 3)
  geo.translate(0, -0.09, 0)
  geo.scale(1.8, 1.8, 1)
  geo.computeVertexNormals()
  return geo
}

/* ═══════════════════════════════════════════════════════
   VINE TRUNKS — 1000 small instanced wood cylinders
   ═══════════════════════════════════════════════════════ */
function VineTrunks() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const tmpColor = new THREE.Color()
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      for (let vine = 0; vine < VINES_PER_ROW; vine++) {
        const x = (row - ROWS / 2) * ROW_SPACING
        const z = (vine - VINES_PER_ROW / 2) * VINE_SPACING
        dummy.position.set(
          x + (sr(row * 100 + vine) - 0.5) * 0.08,
          0.25,
          z + (sr(row * 200 + vine + 50) - 0.5) * 0.08
        )
        dummy.rotation.set(
          (sr(row * 500 + vine) - 0.5) * 0.15,
          sr(row * 400 + vine) * Math.PI * 2,
          (sr(row * 600 + vine) - 0.5) * 0.1
        )
        dummy.scale.set(1, 0.7 + sr(row * 700 + vine) * 0.6, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(idx, dummy.matrix)
        // Per-instance color variation: warm-to-cool brown
        const t = sr(row * 300 + vine * 7)
        tmpColor.setRGB(
          0.28 + t * 0.12,   // R: 0.28 – 0.40
          0.18 + t * 0.08,   // G: 0.18 – 0.26
          0.10 + t * 0.06    // B: 0.10 – 0.16
        )
        mesh.setColorAt(idx, tmpColor)
        idx++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL_VINES]} castShadow>
      <cylinderGeometry args={[0.025, 0.035, 0.55, 6]} />
      <meshStandardMaterial vertexColors roughness={1.0} metalness={0} />
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════════════════
   LEAF CANOPY — 3000 instanced leaves w/ alpha texture
   ═══════════════════════════════════════════════════════ */
function LeafCanopy({ ndviValues, humidityValues }: VineRowsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const leafGeo = useMemo(() => createLeafGeometry(), [])
  const leafTex = useMemo(() => createLeafTexture(), [])

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.03,
      side: THREE.DoubleSide,
      envMapIntensity: 0.8,
      map: leafTex,
      alphaMap: leafTex,
      alphaTest: 0.4,
      transparent: true,
    })
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n#ifdef USE_INSTANCING_COLOR\ntotalEmissiveRadiance += vColor * 0.15;\n#endif'
      )
    }
    return mat
  }, [leafTex])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let idx = 0
    const tmpColor = new THREE.Color()
    for (let row = 0; row < ROWS; row++) {
      const ndvi = ndviValues[row]
      tmpColor.setHex(ndvi > 0.7 ? 0x22c55e : ndvi > 0.5 ? 0xfbbf24 : 0xef4444)
      for (let vine = 0; vine < VINES_PER_ROW; vine++) {
        const x = (row - ROWS / 2) * ROW_SPACING
        const z = (vine - VINES_PER_ROW / 2) * VINE_SPACING
        const baseX = x + (sr(row * 100 + vine) - 0.5) * 0.08
        const baseZ = z + (sr(row * 200 + vine + 50) - 0.5) * 0.08
        for (let leaf = 0; leaf < 3; leaf++) {
          const angle = (leaf / 3) * Math.PI * 2 + sr(idx * 37) * 1.2
          const rad = 0.06 + sr(idx * 19) * 0.08
          dummy.position.set(
            baseX + Math.cos(angle) * rad,
            0.45 + sr(idx * 23) * 0.2,
            baseZ + Math.sin(angle) * rad
          )
          dummy.rotation.set(
            -0.3 + sr(idx * 11) * 0.6,
            sr(idx * 7) * Math.PI * 2,
            (sr(idx * 13) - 0.5) * 0.5
          )
          const s = 0.7 + sr(idx * 41) * 0.6
          dummy.scale.set(s, s, s)
          dummy.updateMatrix()
          mesh.setMatrixAt(idx, dummy.matrix)
          mesh.setColorAt(idx, tmpColor)
          idx++
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [dummy, ndviValues, leafGeo, leafTex])

  const tmpColor = useMemo(() => new THREE.Color(), [])
  const frameCount = useRef(0)
  useFrame(({ clock, invalidate }) => {
    const mesh = meshRef.current
    if (!mesh) return
    frameCount.current++
    if (frameCount.current % 4 !== 0) return
    const t = clock.elapsedTime
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      const hum = humidityValues[row]
      const ndvi = ndviValues[row]
      const pulse =
        1 + Math.sin(t * (0.25 + hum * 0.005) + row * 0.4) *
        (0.06 + (1 - hum / 100) * 0.08)
      tmpColor
        .setHex(ndvi > 0.7 ? 0x22c55e : ndvi > 0.5 ? 0xfbbf24 : 0xef4444)
        .multiplyScalar(pulse)
      for (let vine = 0; vine < VINES_PER_ROW; vine++) {
        for (let leaf = 0; leaf < 3; leaf++) {
          mesh.setColorAt(idx, tmpColor)
          idx++
        }
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    invalidate()
  })

  return (
    <instancedMesh ref={meshRef} args={[leafGeo, material, LEAF_INSTANCES]} castShadow receiveShadow />
  )
}

/* ═══════════════════════════════════════════════════════
   TRELLIS SYSTEM — instanced posts + wire lines
   ═══════════════════════════════════════════════════════ */
function TrellisSystem() {
  const postRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!postRef.current) return
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      const x = (row - ROWS / 2) * ROW_SPACING
      for (let p = 0; p < POSTS_PER_ROW; p++) {
        const z = -ROW_LENGTH / 2 + (p / (POSTS_PER_ROW - 1)) * ROW_LENGTH
        dummy.position.set(x, 0.6, z)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        postRef.current.setMatrixAt(idx, dummy.matrix)
        idx++
      }
    }
    postRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  const wireData = useMemo(() => {
    const lines: { points: [number, number, number][] }[] = []
    for (let row = 0; row < ROWS; row++) {
      const x = (row - ROWS / 2) * ROW_SPACING
      lines.push({ points: [[x, 1.0, -ROW_LENGTH / 2], [x, 1.0, ROW_LENGTH / 2]] })
      lines.push({ points: [[x, 0.7, -ROW_LENGTH / 2], [x, 0.7, ROW_LENGTH / 2]] })
    }
    return lines
  }, [])

  return (
    <group>
      <instancedMesh ref={postRef} args={[undefined, undefined, TOTAL_POSTS]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 1.3, 5]} />
        <meshStandardMaterial color="#7A6A55" roughness={0.9} metalness={0.1} />
      </instancedMesh>
      {wireData.map((w, i) => (
        <Line key={i} points={w.points as [number, number, number][]} color="#888888" lineWidth={0.5} transparent opacity={0.5} />
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   SENSOR NODE — bloom-emissive IoT sphere
   ═══════════════════════════════════════════════════════ */
function SensorNode({
  position, label, value, color = '#60A5FA',
}: {
  position: [number, number, number]; label: string; value: string; color?: string
}) {
  const ref = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const onEnter = useCallback(() => setHovered(true), [])
  const onLeave = useCallback(() => setHovered(false), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ref.current) ref.current.position.y = position[1] + Math.sin(t * 2) * 0.05
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.15)
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 1.5) * 0.1
    }
  })

  return (
    <group>
      <mesh ref={ref} position={position} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 3.0 : 1.5} transparent opacity={0.95} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html position={[position[0], position[1] + 0.7, position[2]]} center>
          <div className="bg-[#1A1A1A]/95 border border-[#D4A843]/50 rounded-lg px-3 py-2 text-xs whitespace-nowrap backdrop-blur-md shadow-lg shadow-black/40">
            <p className="text-[#D4A843] font-bold text-[11px] mb-1">{label}</p>
            <p className="text-[#E5E5E5] font-mono">{value}</p>
          </div>
        </Html>
      )}
    </group>
  )
}
const MemoSensorNode = memo(SensorNode)

/* ═══════════════════════════════════════════════════════
   DRONE MODEL — metallic carbon + rotor wash particles
   ═══════════════════════════════════════════════════════ */
const PARTICLE_COUNT = 40

function DroneModel() {
  const ref = useRef<THREE.Group>(null)
  const propRefs = useRef<THREE.Mesh[]>([])
  const particleRef = useRef<THREE.Points>(null)

  // Rotor wash particle positions
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 1.2
      arr[i * 3 + 1] = -Math.random() * 1.5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.2
    }
    return arr
  }, [])

  const particleSizes = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) arr[i] = 0.02 + Math.random() * 0.04
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.3
    ref.current.position.set(Math.sin(t) * 14, 8 + Math.sin(t * 2) * 0.4, Math.cos(t) * 10)
    ref.current.rotation.y = t + Math.PI / 2
    propRefs.current.forEach((p) => { if (p) p.rotation.y += 0.8 })

    // Animate rotor wash particles
    if (particleRef.current) {
      const pos = particleRef.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let y = pos.getY(i)
        y -= 0.06 + Math.random() * 0.03
        if (y < -2) {
          pos.setXYZ(i, (Math.random() - 0.5) * 1.0, -0.15, (Math.random() - 0.5) * 1.0)
        } else {
          pos.setY(i, y)
          // Slight spread
          pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.02)
          pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.02)
        }
      }
      pos.needsUpdate = true
    }
  })

  return (
    <group ref={ref}>
      {/* Main body — carbon fiber look */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.1, 0.4]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.92} roughness={0.12} envMapIntensity={1.5} />
      </mesh>
      {/* Camera pod */}
      <mesh position={[0.15, -0.1, 0]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#111" metalness={0.95} roughness={0.08} envMapIntensity={1.5} />
      </mesh>
      {/* Camera lens */}
      <mesh position={[0.15, -0.12, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#222266" metalness={0.3} roughness={0.1} />
      </mesh>
      {/* Arms + motors + propellers */}
      {([[-0.4, 0, -0.3], [0.4, 0, -0.3], [-0.4, 0, 0.3], [0.4, 0, 0.3]] as [number, number, number][]).map((p, i) => (
        <group key={i} position={p}>
          {/* Arm */}
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.08, 6]} />
            <meshStandardMaterial color="#222" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Motor housing */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 10]} />
            <meshStandardMaterial color="#333" metalness={0.92} roughness={0.1} />
          </mesh>
          {/* Propeller disc */}
          <mesh ref={(el) => { if (el) propRefs.current[i] = el }} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.006, 3]} />
            <meshStandardMaterial color="#555" metalness={0.5} transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
      {/* Landing gear legs */}
      {[-0.2, 0.2].map((z, i) => (
        <mesh key={`leg-${i}`} position={[0, -0.12, z]}>
          <boxGeometry args={[0.5, 0.015, 0.015]} />
          <meshStandardMaterial color="#222" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* Nav lights */}
      <pointLight position={[0, -0.15, 0]} intensity={0.5} color="#4ADE80" distance={5} />
      <mesh position={[-0.35, 0.02, 0]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[0.35, 0.02, 0]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* Rotor wash particle system */}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[particleSizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#998877"
          transparent
          opacity={0.25}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   WINERY BUILDING — stone texture + real tile roof
   ═══════════════════════════════════════════════════════ */

/** Generate a normal map from the stone brick pattern using gradient computation */
function createStoneNormalMap(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const bx = Math.floor(x / 32), by = Math.floor(y / 24)
      const offsetRow = (by % 2 === 0) ? 0 : 16
      const lx = (x + offsetRow) % 32, ly = y % 24
      const isMortar = lx < 1 || ly < 1
      // Height at current, right, and up neighbors
      const hC = isMortar ? 0 : 0.5 + hash(bx + offsetRow, by) * 0.3 + fbm(x * 0.08, y * 0.08, 3) * 0.2
      const hR = ((x + 1 + offsetRow) % 32 < 1) ? 0 : 0.5 + hash(Math.floor((x + 1) / 32) + offsetRow, by) * 0.3 + fbm((x + 1) * 0.08, y * 0.08, 3) * 0.2
      const hU = ((y + 1) % 24 < 1) ? 0 : 0.5 + hash(bx + offsetRow, Math.floor((y + 1) / 24)) * 0.3 + fbm(x * 0.08, (y + 1) * 0.08, 3) * 0.2
      // Gradient → normal
      const dx = (hR - hC) * 4.0, dy = (hU - hC) * 4.0
      data[i] = Math.min(255, Math.max(0, (dx * 0.5 + 0.5) * 255))
      data[i + 1] = Math.min(255, Math.max(0, (dy * 0.5 + 0.5) * 255))
      data[i + 2] = 200 // Z component — mostly pointing up
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 3)
  tex.needsUpdate = true
  return tex
}

function WineryBuilding() {
  const stoneTex = useMemo(() => createStoneTexture(), [])
  const stoneDispMap = useMemo(() => createStoneDisplacementMap(), [])
  const stoneNormalMap = useMemo(() => createStoneNormalMap(), [])

  return (
    <group position={[0, 0, -22]}>
      {/* Main building body — RoundedBox for beveled edges */}
      <RoundedBox args={[16, 5.5, 9]} radius={0.04} smoothness={4} position={[0, 2.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneTex}
          normalMap={stoneNormalMap}
          normalScale={new THREE.Vector2(2.5, 2.5)}
          displacementMap={stoneDispMap}
          displacementScale={0.1}
          roughness={0.9}
          metalness={0.02}
          envMapIntensity={0.7}
        />
      </RoundedBox>

      {/* Roof ridge beam */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[17, 0.15, 0.15]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Tile roof — front slope with eaves overhang */}
      <group position={[0, 5.7, 2.5]} rotation={[0.35, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[18.5, 0.12, 6.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.92} metalness={0.02} />
        </mesh>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`tile-f-${i}`} position={[0, 0.09, -3.0 + i * 0.56]} castShadow>
            <boxGeometry args={[18.5, 0.06, 0.3]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#A0522D' : '#8B4513'} roughness={0.9} />
          </mesh>
        ))}
        {/* Eaves — protruding fascia board under front roof edge */}
        <mesh position={[0, -0.1, 3.15]} castShadow>
          <boxGeometry args={[18.5, 0.2, 0.15]} />
          <meshStandardMaterial color="#5C4033" roughness={0.9} />
        </mesh>
      </group>

      {/* Tile roof — back slope with eaves */}
      <group position={[0, 5.7, -2.5]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[18.5, 0.12, 6.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.92} metalness={0.02} />
        </mesh>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`tile-b-${i}`} position={[0, 0.09, -3.0 + i * 0.56]} castShadow>
            <boxGeometry args={[18.5, 0.06, 0.3]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#A0522D' : '#8B4513'} roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, -0.1, -3.15]} castShadow>
          <boxGeometry args={[18.5, 0.2, 0.15]} />
          <meshStandardMaterial color="#5C4033" roughness={0.9} />
        </mesh>
      </group>

      {/* Gable-side eaves (left and right) */}
      <mesh position={[8.8, 5.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.18, 10.2]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>
      <mesh position={[-8.8, 5.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.18, 10.2]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>

      {/* Entrance archway */}
      <mesh position={[0, 1.8, 4.51]}>
        <planeGeometry args={[3, 3.6]} />
        <meshStandardMaterial color="#2A1F15" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.6, 4.52]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.18, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#7A6A55" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Keystone — RoundedBox */}
      <RoundedBox args={[0.4, 0.5, 0.2]} radius={0.02} smoothness={4} position={[0, 5.1, 4.53]} castShadow>
        <meshStandardMaterial color="#9A8A7A" roughness={0.82} />
      </RoundedBox>

      {/* Windows with warm glow + stone frames */}
      {([-5, -2.5, 2.5, 5] as number[]).map((x) => (
        <group key={x}>
          <mesh position={[x, 3.5, 4.51]}>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial color="#1A1A1A" emissive="#FF9944" emissiveIntensity={0.4} />
          </mesh>
          {/* Stone window frame */}
          <mesh position={[x, 3.5, 4.52]}>
            <planeGeometry args={[1.2, 1.6]} />
            <meshStandardMaterial color="#6A5A4A" roughness={0.9} />
          </mesh>
          {/* Window sill */}
          <mesh position={[x, 2.75, 4.6]} castShadow>
            <boxGeometry args={[1.3, 0.08, 0.2]} />
            <meshStandardMaterial color="#7A6A55" roughness={0.88} />
          </mesh>
        </group>
      ))}

      {/* Side extension — RoundedBox with stone texture */}
      <RoundedBox args={[5, 3.5, 7]} radius={0.03} smoothness={4} position={[-10, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneTex}
          normalMap={stoneNormalMap}
          normalScale={new THREE.Vector2(2.5, 2.5)}
          displacementMap={stoneDispMap}
          displacementScale={0.06}
          roughness={0.9}
          metalness={0.02}
          envMapIntensity={0.7}
        />
      </RoundedBox>
      {/* Extension roof */}
      <group position={[-10, 3.5, 0]} rotation={[0.2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[5.8, 0.1, 4.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.92} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={`ext-tile-${i}`} position={[0, 0.08, -1.8 + i * 0.65]} castShadow>
            <boxGeometry args={[5.8, 0.05, 0.35]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#A0522D' : '#8B4513'} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Loading dock — RoundedBox */}
      <RoundedBox args={[2, 0.8, 3]} radius={0.02} smoothness={4} position={[8.5, 0.4, 2]} castShadow>
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
      </RoundedBox>

      {/* Chimney — RoundedBox for organic stone look */}
      <RoundedBox args={[0.6, 2.5, 0.6]} radius={0.03} smoothness={4} position={[3, 7.5, -1]} castShadow>
        <meshStandardMaterial color="#6A5545" roughness={0.88} envMapIntensity={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.15, 0.8]} radius={0.02} smoothness={4} position={[3, 8.8, -1]} castShadow>
        <meshStandardMaterial color="#7A6555" roughness={0.85} />
      </RoundedBox>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   IRRIGATION DRIP LINES
   ═══════════════════════════════════════════════════════ */
function IrrigationLines() {
  const lines = useMemo(() => {
    const result: { points: [number, number, number][] }[] = []
    for (let row = 0; row < ROWS; row += 2) {
      const x = (row - ROWS / 2) * ROW_SPACING + 0.15
      result.push({ points: [[x, 0.04, -ROW_LENGTH / 2], [x, 0.04, ROW_LENGTH / 2]] })
    }
    return result
  }, [])
  return <group>{lines.map((l, i) => <Line key={i} points={l.points} color="#1E3A5F" lineWidth={1} transparent opacity={0.4} />)}</group>
}

function AccessPath() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[2.5, ROW_LENGTH + 4]} />
      <meshStandardMaterial color="#6B5D4F" roughness={0.98} metalness={0} />
    </mesh>
  )
}

function SceneAnimationDriver() {
  useFrame(({ invalidate }) => { invalidate() })
  return null
}

/* ═══════════════════════════════════════════════════════
   MAIN SCENE EXPORT — 1000 vines + full detail
   ═══════════════════════════════════════════════════════ */
interface VineyardSceneProps {
  onRowSelect?: (index: number | null) => void
}

export default function VineyardScene({ onRowSelect }: VineyardSceneProps) {
  const ndviValues = useMemo(() => Array.from({ length: ROWS }, (_, i) => 0.45 + sr(i * 17) * 0.45), [])
  const humidityValues = useMemo(() => Array.from({ length: ROWS }, (_, i) => 30 + sr(i * 31 + 7) * 60), [])

  return (
    <group>
      <SceneAnimationDriver />
      <Terrain />
      <AccessPath />
      <TrellisSystem />
      <VineTrunks />
      <LeafCanopy ndviValues={ndviValues} humidityValues={humidityValues} />
      <IrrigationLines />

      <MemoSensorNode position={[-16, 1.5, -6]} label="T/HR Campo" value="19°C | 68% HR" color="#60A5FA" />
      <MemoSensorNode position={[0, 1.2, 8]} label="Sonda Suelo 30cm" value="57% humedad | 16°C" color="#22C55E" />
      <MemoSensorNode position={[14, 1.5, -4]} label="Sensor Hoja" value="Potencial: -0.4 MPa" color="#FBBF24" />
      <MemoSensorNode position={[-10, 2.5, 10]} label="Estación Meteo" value="19°C | UV 4 | 12 km/h NW" color="#A78BFA" />
      <MemoSensorNode position={[10, 1.2, -10]} label="Piranómetro" value="Solar: 642 W/m²" color="#F97316" />

      <DroneModel />
      <WineryBuilding />

      {/* Corner vineyard posts */}
      {([[-24, 0.15, -12], [24, 0.15, -12], [-24, 0.15, 12], [24, 0.15, 12]] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.3, 6]} />
          <meshStandardMaterial color="#888" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
