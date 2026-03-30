'use client'
import React, { useRef, useState, useMemo, useEffect, memo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, RoundedBox, ContactShadows } from '@react-three/drei'
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
        // Procedural albedo stain — fbm modulates brightness per stone
        const stain = 0.7 + fbm(x * 0.03 + bx * 2.7, y * 0.03 + by * 3.1, 4) * 0.5
        data[i] = Math.min(255, base * 0.85 * stain)
        data[i + 1] = Math.min(255, base * 0.78 * stain)
        data[i + 2] = Math.min(255, base * 0.65 * stain)
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
   TERRAIN — displaced with vertex colors + soil texture
   ═══════════════════════════════════════════════════════ */

/** Procedural soil albedo — dry dirt, sand, grass patches + gravel */
function createSoilAlbedoTexture(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Large moisture patches
      const moisture = fbm(x * 0.03 + 7.3, y * 0.03 + 4.1, 4)
      // Fine grain noise
      const grain = fbm(x * 0.2, y * 0.2, 3)
      // Gravel speckles
      const speckle = hash(x * 3, y * 3) > 0.92 ? 0.15 : 0
      // Sandy patches — warm yellow-beige
      const sandNoise = fbm(x * 0.04 + 30, y * 0.04 + 60, 3)
      const sandMask = sandNoise > 0.6 ? (sandNoise - 0.6) * 3.0 : 0
      // Grass tufts — rich green
      const grassNoise = fbm(x * 0.05 + 90, y * 0.05 + 120, 4)
      const grassMask = grassNoise > 0.62 ? (grassNoise - 0.62) * 4.0 : 0
      // Base earth - modulated by moisture
      const wetFactor = moisture < 0.4 ? 1.0 - (0.4 - moisture) * 0.8 : 1.0
      const base = (0.55 + grain * 0.2 - speckle) * wetFactor
      let r = base * 0.85, g = base * 0.75, b = base * 0.58
      // Blend sand (warm beige)
      r += sandMask * 0.15
      g += sandMask * 0.12
      b += sandMask * 0.04
      // Blend grass (olive green)
      r -= grassMask * 0.12
      g += grassMask * 0.1
      b -= grassMask * 0.06
      data[i]     = Math.min(255, Math.max(0, r * 255))
      data[i + 1] = Math.min(255, Math.max(0, g * 255))
      data[i + 2] = Math.min(255, Math.max(0, b * 255))
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(14, 14)
  tex.needsUpdate = true
  return tex
}

/** Procedural displacement map — gentle rolling terrain */
function createTerrainDisplacementMap(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Broad smooth hills
      const hill = fbm(x * 0.015, y * 0.015, 3) * 0.7
      // Finer undulations
      const ripple = fbm(x * 0.06 + 20, y * 0.06 + 40, 2) * 0.3
      const v = Math.min(255, Math.max(0, (hill + ripple) * 255))
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.needsUpdate = true
  return tex
}

function Terrain() {
  const ref = useRef<THREE.Mesh>(null)
  const normalMap = useMemo(() => createSoilNormalMap(), [])
  const soilAlbedo = useMemo(() => createSoilAlbedoTexture(), [])
  const terrainDisp = useMemo(() => createTerrainDisplacementMap(), [])
  const bumpMap = useMemo(() => {
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
      <planeGeometry args={[100, 100, 200, 200]} />
      <meshStandardMaterial
        vertexColors
        map={soilAlbedo}
        roughness={0.96}
        metalness={0}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1.4, 1.4)}
        bumpMap={bumpMap}
        bumpScale={0.25}
        displacementMap={terrainDisp}
        displacementScale={0.4}
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════
   GROUND SCATTER — random stones + grass blades
   ═══════════════════════════════════════════════════════ */
const STONE_COUNT = 300
const GRASS_COUNT = 600

function GroundScatter() {
  const stoneRef = useRef<THREE.InstancedMesh>(null!)
  const grassRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    // Scatter small stones
    if (stoneRef.current) {
      const tmpColor = new THREE.Color()
      for (let i = 0; i < STONE_COUNT; i++) {
        const x = (sr(i * 13 + 1) - 0.5) * 90
        const z = (sr(i * 17 + 3) - 0.5) * 90
        dummy.position.set(x, -0.02 + sr(i * 23) * 0.03, z)
        dummy.rotation.set(sr(i * 7) * Math.PI, sr(i * 11) * Math.PI, sr(i * 19) * Math.PI)
        const s = 0.04 + sr(i * 29) * 0.1
        dummy.scale.set(s, s * (0.5 + sr(i * 31) * 0.5), s)
        dummy.updateMatrix()
        stoneRef.current.setMatrixAt(i, dummy.matrix)
        const grey = 0.35 + sr(i * 37) * 0.3
        tmpColor.setRGB(grey, grey * 0.95, grey * 0.88)
        stoneRef.current.setColorAt(i, tmpColor)
      }
      stoneRef.current.instanceMatrix.needsUpdate = true
      if (stoneRef.current.instanceColor) stoneRef.current.instanceColor.needsUpdate = true
    }
    // Scatter grass blades
    if (grassRef.current) {
      const tmpColor = new THREE.Color()
      for (let i = 0; i < GRASS_COUNT; i++) {
        const x = (sr(i * 41 + 5) - 0.5) * 85
        const z = (sr(i * 43 + 9) - 0.5) * 85
        dummy.position.set(x, 0.06 + sr(i * 47) * 0.04, z)
        dummy.rotation.set(0, sr(i * 53) * Math.PI * 2, (sr(i * 59) - 0.5) * 0.3)
        const sy = 0.06 + sr(i * 61) * 0.1
        dummy.scale.set(0.02, sy, 0.01)
        dummy.updateMatrix()
        grassRef.current.setMatrixAt(i, dummy.matrix)
        const g = 0.25 + sr(i * 67) * 0.2
        tmpColor.setRGB(g * 0.7, g, g * 0.3)
        grassRef.current.setColorAt(i, tmpColor)
      }
      grassRef.current.instanceMatrix.needsUpdate = true
      if (grassRef.current.instanceColor) grassRef.current.instanceColor.needsUpdate = true
    }
  }, [dummy])

  return (
    <group>
      <instancedMesh ref={stoneRef} args={[undefined, undefined, STONE_COUNT]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
      </instancedMesh>
      <instancedMesh ref={grassRef} args={[undefined, undefined, GRASS_COUNT]} castShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial vertexColors roughness={0.8} metalness={0} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
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
          (sr(row * 500 + vine) - 0.5) * 0.25,
          sr(row * 400 + vine) * Math.PI * 2,
          (sr(row * 600 + vine) - 0.5) * 0.2
        )
        const scaleJitter = 0.9 + sr(row * 800 + vine * 3) * 0.2
        dummy.scale.set(scaleJitter, (0.7 + sr(row * 700 + vine) * 0.6) * scaleJitter, scaleJitter)
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
   SENSOR HUD — military-style leader lines + anchor
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

  // Leader line from sensor down to ground
  const leaderPoints = useMemo((): [number, number, number][] => [
    [position[0], position[1], position[2]],
    [position[0], 0.05, position[2]],
  ], [position])

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
      {/* Leader line — thin vertical to ground */}
      <Line
        points={leaderPoints}
        color={color}
        lineWidth={1.2}
        transparent
        opacity={0.45}
        dashed
        dashSize={0.15}
        dashScale={1}
        gapSize={0.08}
      />
      {/* Anchor circle at ground level */}
      <mesh position={[position[0], 0.04, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.16, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Anchor dot */}
      <mesh position={[position[0], 0.04, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>

      {/* Sensor sphere */}
      <mesh ref={ref} position={position} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 3.0 : 1.5} transparent opacity={0.95} toneMapped={false} />
      </mesh>
      {/* Pulse ring around sensor */}
      <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* HUD label — always visible, compact military style */}
      <Html position={[position[0] + 0.3, position[1] + 0.15, position[2]]} center>
        <div style={{ background: 'rgba(10,10,10,0.85)', border: `1px solid ${color}40`, borderRadius: '4px', padding: '3px 8px', fontSize: '9px', fontFamily: 'monospace', whiteSpace: 'nowrap', userSelect: 'none', color: '#E0E0E0', letterSpacing: '0.5px', backdropFilter: 'blur(4px)' }}>
          <span style={{ color, fontWeight: 700, marginRight: '6px' }}>{label}</span>
          <span>{value}</span>
        </div>
      </Html>

      {/* Expanded HUD on hover */}
      {hovered && (
        <Html position={[position[0], position[1] + 0.7, position[2]]} center>
          <div className="bg-[#0A0A0A]/95 border rounded-lg px-4 py-2.5 text-xs whitespace-nowrap backdrop-blur-md shadow-lg shadow-black/50" style={{ borderColor: `${color}60` }}>
            <p style={{ color, fontWeight: 700, fontSize: '11px', marginBottom: '4px', letterSpacing: '1px' }}>{label}</p>
            <p className="text-[#E5E5E5] font-mono" style={{ fontSize: '12px' }}>{value}</p>
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
   CONTEMPORARY WINERY — Protos / Foster + Partners style
   Concrete + Corten steel + tinted glass + I-beams
   ═══════════════════════════════════════════════════════ */

/** Procedural concrete normal map — formwork lines + micro-pores */
function createConcreteNormalMap(w = 256, h = 256): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Formwork board lines every 32px
      const boardEdge = y % 32 < 1 ? 0.3 : 0
      const pore = fbm(x * 0.15, y * 0.15, 4) * 0.4
      const hC = 0.5 + pore - boardEdge
      const hR = 0.5 + fbm((x + 1) * 0.15, y * 0.15, 4) * 0.4 - ((y % 32 < 1) ? 0.3 : 0)
      const hU = 0.5 + fbm(x * 0.15, (y + 1) * 0.15, 4) * 0.4 - (((y + 1) % 32 < 1) ? 0.3 : 0)
      const dx = (hR - hC) * 3.0, dy = (hU - hC) * 3.0
      data[i] = Math.min(255, Math.max(0, (dx * 0.5 + 0.5) * 255))
      data[i + 1] = Math.min(255, Math.max(0, (dy * 0.5 + 0.5) * 255))
      data[i + 2] = 210
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 4)
  tex.needsUpdate = true
  return tex
}

/** Procedural corten steel texture — rust orange with dark streaks */
function createCortenTexture(w = 128, h = 128): THREE.DataTexture {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const n1 = fbm(x * 0.06, y * 0.06, 4)
      const n2 = fbm(x * 0.12 + 50, y * 0.12 + 80, 3)
      const streak = Math.max(0, Math.sin(y * 0.3 + n1 * 4) * 0.3)
      const base = 0.45 + n1 * 0.25 - streak
      data[i] = Math.min(255, Math.max(0, (base * 0.85 + n2 * 0.08) * 255))     // R rust
      data[i + 1] = Math.min(255, Math.max(0, (base * 0.42 + n2 * 0.04) * 255)) // G
      data[i + 2] = Math.min(255, Math.max(0, (base * 0.18) * 255))              // B
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 2)
  tex.needsUpdate = true
  return tex
}

function WineryBuilding() {
  const concreteNormal = useMemo(() => createConcreteNormalMap(), [])
  const cortenTex = useMemo(() => createCortenTexture(), [])
  const stoneNormal = useMemo(() => {
    const w = 256, h = 256
    const data = new Uint8Array(w * h * 4)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const bx = Math.floor(x / 32), by = Math.floor(y / 24)
        const offsetRow = (by % 2 === 0) ? 0 : 16
        const lx = (x + offsetRow) % 32, ly = y % 24
        const isMortar = lx < 1 || ly < 1
        const hC = isMortar ? 0 : 0.5 + hash(bx + offsetRow, by) * 0.3 + fbm(x * 0.08, y * 0.08, 3) * 0.2
        const hR = ((x + 1 + offsetRow) % 32 < 1) ? 0 : 0.5 + hash(Math.floor((x + 1) / 32) + offsetRow, by) * 0.3 + fbm((x + 1) * 0.08, y * 0.08, 3) * 0.2
        const hU = ((y + 1) % 24 < 1) ? 0 : 0.5 + hash(bx + offsetRow, Math.floor((y + 1) / 24)) * 0.3 + fbm(x * 0.08, (y + 1) * 0.08, 3) * 0.2
        const dx = (hR - hC) * 4.0, dy = (hU - hC) * 4.0
        data[i] = Math.min(255, Math.max(0, (dx * 0.5 + 0.5) * 255))
        data[i + 1] = Math.min(255, Math.max(0, (dy * 0.5 + 0.5) * 255))
        data[i + 2] = 200
        data[i + 3] = 255
      }
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 3)
    tex.needsUpdate = true
    return tex
  }, [])

  return (
    <group position={[0, 0, -22]}>

      {/* ━━━ MAIN NAVE — exposed concrete, elongated rectangle ━━━ */}
      <RoundedBox args={[28, 6, 12]} radius={0.03} smoothness={4} position={[0, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#B0A99A"
          normalMap={concreteNormal}
          normalScale={new THREE.Vector2(2.0, 2.0)}
          roughness={0.88}
          metalness={0.02}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Flat roof slab — monolithic concrete overhang, casts bold shadow */}
      <mesh position={[0, 5.12, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[30, 0.25, 14]} />
        <meshStandardMaterial color="#9A9488" roughness={0.7} metalness={0.03} envMapIntensity={1.0} />
      </mesh>

      {/* ━━━ CORTEN STEEL WING — barrel aging / admin ━━━ */}
      <RoundedBox args={[14, 4.5, 10]} radius={0.02} smoothness={4} position={[-12, 1.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          map={cortenTex}
          roughness={0.78}
          metalness={0.35}
          envMapIntensity={1.8}
        />
      </RoundedBox>
      {/* Corten wing flat roof */}
      <mesh position={[-12, 3.62, 0]} castShadow>
        <boxGeometry args={[15.5, 0.2, 11.5]} />
        <meshStandardMaterial color="#6B3A1F" roughness={0.75} metalness={0.3} />
      </mesh>

      {/* ━━━ GLASS CURTAIN WALL — south facade ━━━ */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = -10.5 + i * 3
        return (
          <group key={`glass-${i}`}>
            {/* Tinted glass panel */}
            <mesh position={[x, 2.5, 6.05]} receiveShadow>
              <planeGeometry args={[2.6, 4.5]} />
              <meshStandardMaterial
                color="#1A2A3A"
                roughness={0.05}
                metalness={0.9}
                envMapIntensity={3.0}
                transparent
                opacity={0.72}
              />
            </mesh>
            {/* Steel mullion */}
            <mesh position={[x - 1.3, 2.5, 6.08]} castShadow>
              <boxGeometry args={[0.06, 4.8, 0.08]} />
              <meshStandardMaterial color="#2A2A2A" roughness={0.3} metalness={0.85} />
            </mesh>
          </group>
        )
      })}
      {/* Final mullion */}
      <mesh position={[13.2, 2.5, 6.08]} castShadow>
        <boxGeometry args={[0.06, 4.8, 0.08]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Horizontal transom */}
      <mesh position={[0, 4.85, 6.08]} castShadow>
        <boxGeometry args={[27, 0.06, 0.08]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Interior warm glow visible through glass */}
      <mesh position={[0, 2.5, 5.9]}>
        <planeGeometry args={[24, 4.2]} />
        <meshStandardMaterial color="#0A0A0A" emissive="#FF9944" emissiveIntensity={0.2} />
      </mesh>

      {/* ━━━ STRUCTURAL I-BEAMS — exposed steel ━━━ */}
      {Array.from({ length: 5 }, (_, i) => {
        const x = -12 + i * 6
        return (
          <group key={`beam-${i}`}>
            {/* Web */}
            <mesh position={[x, 5.35, 0]} castShadow>
              <boxGeometry args={[0.06, 0.3, 13]} />
              <meshStandardMaterial color="#333" roughness={0.35} metalness={0.9} />
            </mesh>
            {/* Top flange */}
            <mesh position={[x, 5.5, 0]}>
              <boxGeometry args={[0.3, 0.04, 13]} />
              <meshStandardMaterial color="#333" roughness={0.35} metalness={0.9} />
            </mesh>
            {/* Bottom flange */}
            <mesh position={[x, 5.2, 0]}>
              <boxGeometry args={[0.3, 0.04, 13]} />
              <meshStandardMaterial color="#333" roughness={0.35} metalness={0.9} />
            </mesh>
          </group>
        )
      })}

      {/* ━━━ GRAPE RECEPTION — cantilevered canopy ━━━ */}
      <group position={[15, 0, 3]}>
        {/* Loading dock platform */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 1, 8]} />
          <meshStandardMaterial color="#8A8278" roughness={0.85} metalness={0.03} />
        </mesh>
        {/* Steel canopy columns — concrete/stone roughness */}
        {[[-2.5, 3], [2.5, 3], [-2.5, -3], [2.5, -3]].map(([cx, cz], i) => (
          <mesh key={`col-${i}`} position={[cx, 2.8, cz]} castShadow>
            <boxGeometry args={[0.15, 4.6, 0.15]} />
            <meshStandardMaterial color="#6A6358" roughness={0.7} metalness={0.08} />
          </mesh>
        ))}
        {/* Canopy roof — concrete overhang */}
        <mesh position={[0, 5.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[7, 0.08, 9]} />
          <meshStandardMaterial color="#8A8278" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Canopy edge beam */}
        <mesh position={[0, 5.0, 4.5]} castShadow>
          <boxGeometry args={[7, 0.25, 0.1]} />
          <meshStandardMaterial color="#5A5550" roughness={0.7} metalness={0.08} />
        </mesh>
        {/* Ramp down to ground */}
        <mesh position={[0, 0.15, 5.5]} rotation={[0.12, 0, 0]} receiveShadow>
          <boxGeometry args={[5, 0.12, 3.5]} />
          <meshStandardMaterial color="#7A7268" roughness={0.9} metalness={0.02} />
        </mesh>
      </group>

      {/* ━━━ INDUSTRIAL CHIMNEY — ventilation stack ━━━ */}
      <mesh position={[-6, 5.5, -3]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 5, 12]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.75} />
      </mesh>
      <mesh position={[-6, 8.1, -3]}>
        <cylinderGeometry args={[0.35, 0.25, 0.15, 12]} />
        <meshStandardMaterial color="#555" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* ━━━ SEMI-UNDERGROUND: terrain ramp cut ━━━ */}
      <mesh position={[0, -0.1, 8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 5]} />
        <meshStandardMaterial color="#6B5D4F" roughness={0.95} metalness={0} />
      </mesh>
      {/* Access ramp — descending into building */}
      <mesh position={[5, -0.3, 9.5]} rotation={[-0.08, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[4, 0.15, 6]} />
        <meshStandardMaterial color="#7A7268" roughness={0.92} metalness={0.02} />
      </mesh>
      {/* Ramp retaining walls */}
      <mesh position={[3, 0.3, 9.5]} castShadow>
        <boxGeometry args={[0.2, 1.2, 6]} />
        <meshStandardMaterial color="#8A8278" roughness={0.85} />
      </mesh>
      <mesh position={[7, 0.3, 9.5]} castShadow>
        <boxGeometry args={[0.2, 1.2, 6]} />
        <meshStandardMaterial color="#8A8278" roughness={0.85} />
      </mesh>

      {/* ━━━ DRY STONE PERIMETER WALL ━━━ */}
      {/* Front wall connecting to vineyard rows */}
      <mesh position={[0, 0.4, 14]} castShadow receiveShadow>
        <boxGeometry args={[50, 0.9, 0.5, 40, 8, 4]} />
        <meshStandardMaterial
          map={useMemo(() => createStoneTexture(256, 256), [])}
          normalMap={stoneNormal}
          normalScale={new THREE.Vector2(2.0, 2.0)}
          roughness={0.95}
          metalness={0.01}
        />
      </mesh>
      {/* Side wall — east */}
      <mesh position={[25, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.8, 28, 4, 8, 20]} />
        <meshStandardMaterial
          map={useMemo(() => createStoneTexture(256, 256), [])}
          normalMap={stoneNormal}
          normalScale={new THREE.Vector2(2.0, 2.0)}
          roughness={0.95}
          metalness={0.01}
        />
      </mesh>
      {/* Side wall — west */}
      <mesh position={[-25, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.8, 28, 4, 8, 20]} />
        <meshStandardMaterial
          map={useMemo(() => createStoneTexture(256, 256), [])}
          normalMap={stoneNormal}
          normalScale={new THREE.Vector2(2.0, 2.0)}
          roughness={0.95}
          metalness={0.01}
        />
      </mesh>

      {/* ━━━ SIGNAGE — Bodega name on concrete facade ━━━ */}
      <Html position={[0, 4, -6.05]} transform scale={0.3}>
        <div style={{ color: '#D4A843', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, letterSpacing: '8px', textTransform: 'uppercase', whiteSpace: 'nowrap', userSelect: 'none' }}>
          Bodega del Duero
        </div>
      </Html>

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
      <GroundScatter />
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

      {/* ContactShadows under building */}
      <ContactShadows
        position={[0, -0.02, -22]}
        opacity={0.55}
        scale={40}
        blur={2.5}
        far={8}
        color="#1A1000"
      />
      {/* ContactShadows under vine rows */}
      <ContactShadows
        position={[0, -0.02, 0]}
        opacity={0.35}
        scale={60}
        blur={2.5}
        far={4}
        color="#221100"
      />

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
