'use client';

import { useRef, useEffect, useState } from 'react';

/* ─── Lazy-load THREE.js from CDN ─── */
function loadThree(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).THREE) { resolve((window as any).THREE); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = () => resolve((window as any).THREE);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ─── Seeded random ─── */
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

/* ─── Terrain height helper ─── */
function terrainH(x: number, z: number): number {
  return Math.sin(x * 0.25) * Math.cos(z * 0.25) * 1.2 + Math.sin(x * 0.08 + 1.5) * 0.8;
}

/* ─── NDVI to colour ─── */
function ndviColor(n: number): [number, number, number] {
  if (n > 0.7) return [0.22, 0.55, 0.18];
  if (n > 0.5) return [0.35, 0.58, 0.22];
  if (n > 0.3) return [0.55, 0.58, 0.28];
  if (n > 0.1) return [0.62, 0.52, 0.32];
  return [0.45, 0.38, 0.28];
}

/* ─── Mobile fallback ─── */
function MobileFallback() {
  return (
    <div className="w-full relative" style={{ aspectRatio: '1/0.85', maxHeight: 360 }}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0B1220 0%, #0F172A 40%, #1a3a1e 80%, #111C2E 100%)',
          border: '1px solid rgba(20,184,166,.08)',
        }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14B8A6" strokeWidth="0.5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(60,140,60,.12) 0%, transparent 60%)',
        }} />
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function HeroTerrain() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  useEffect(() => {
    if (isMobile) return;
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let animId = 0;
    let renderer: any;

    (async () => {
      let THREE: any;
      try { THREE = await loadThree(); } catch { setWebglFailed(true); return; }
      if (disposed) return;

      const rand = seeded(42);
      const w = mount.clientWidth;
      const h = Math.min(w * 0.85, 500);

      /* ═══ Scene ═══ */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0B1220);
      scene.fog = new THREE.FogExp2(0x0B1220, 0.010);

      /* ═══ Camera ═══ */
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 500);
      camera.position.set(28, 22, 28);
      camera.lookAt(0, 0, 0);

      /* ═══ Renderer ═══ */
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
      catch { setWebglFailed(true); return; }
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.6;
      if (disposed) { renderer.dispose(); return; }
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.borderRadius = '16px';

      /* ═══ LIGHTING — bright European golden-hour ═══ */
      const ambient = new THREE.AmbientLight(0x4a6070, 1.4);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xffeedd, 2.8);
      sun.position.set(15, 25, 10);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 80;
      sun.shadow.camera.left = -25;
      sun.shadow.camera.right = 25;
      sun.shadow.camera.top = 25;
      sun.shadow.camera.bottom = -25;
      scene.add(sun);

      const fill = new THREE.DirectionalLight(0x88aacc, 0.8);
      fill.position.set(-10, 15, -5);
      scene.add(fill);

      const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x3a5f3a, 0.6);
      scene.add(skyLight);

      const tealAccent = new THREE.PointLight(0x14B8A6, 0.4, 50);
      tealAccent.position.set(-8, 12, -8);
      scene.add(tealAccent);

      /* ═══ TERRAIN — brighter NDVI dehesa ═══ */
      const GRID = 32;
      const SIZE = 36;
      const terrGeo = new THREE.PlaneGeometry(SIZE, SIZE, GRID, GRID);
      terrGeo.rotateX(-Math.PI / 2);
      const pos = terrGeo.attributes.position.array;
      const ndviArr: number[] = [];
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] = terrainH(pos[i], pos[i + 2]);
        ndviArr.push(0.15 + rand() * 0.85);
      }
      terrGeo.computeVertexNormals();

      const cols = new Float32Array((pos.length / 3) * 3);
      for (let i = 0; i < ndviArr.length; i++) {
        const [r, g, b] = ndviColor(ndviArr[i]);
        cols[i * 3] = r;
        cols[i * 3 + 1] = g;
        cols[i * 3 + 2] = b;
      }
      terrGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

      const terrMat = new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: 0.85, metalness: 0.0, flatShading: true,
      });
      const terrain = new THREE.Mesh(terrGeo, terrMat);
      terrain.receiveShadow = true;
      scene.add(terrain);

      /* subtle grid overlay */
      const grid = new THREE.GridHelper(SIZE, GRID, 0x14B8A6, 0x14B8A6);
      (grid.material as any).opacity = 0.04;
      (grid.material as any).transparent = true;
      grid.position.y = 0.05;
      scene.add(grid);

      /* ═══ TREES — encinas mediterráneas ═══ */
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.95 });
      for (let i = 0; i < 25; i++) {
        const angle = rand() * Math.PI * 2;
        const radius = 3 + rand() * 13;
        const tx = Math.cos(angle) * radius;
        const tz = Math.sin(angle) * radius;
        const sz = 0.7 + rand() * 0.6;
        const th = terrainH(tx, tz);

        const grp = new THREE.Group();
        // trunk
        const trGeo = new THREE.CylinderGeometry(0.08 * sz, 0.12 * sz, 1.2 * sz, 6);
        const trunk = new THREE.Mesh(trGeo, trunkMat);
        trunk.position.y = 0.6 * sz;
        trunk.castShadow = true;
        grp.add(trunk);
        // crown (flattened sphere = encina shape)
        const crGeo = new THREE.SphereGeometry(0.7 * sz, 8, 6);
        crGeo.scale(1, 0.6, 1);
        const crMat = new THREE.MeshStandardMaterial({
          color: rand() > 0.5 ? 0x2D5A27 : 0x3A6E30, roughness: 0.85,
        });
        const crown = new THREE.Mesh(crGeo, crMat);
        crown.position.y = 1.5 * sz;
        crown.castShadow = true;
        grp.add(crown);

        grp.position.set(tx, th, tz);
        scene.add(grp);
      }

      /* ═══ BUILDINGS — realistic barns with gabled roof ═══ */
      const statusColors: Record<string, number> = { ok: 0x16A34A, warn: 0xD97706, alert: 0xDC2626 };
      const barns = [
        { x: -6, z: -3, w: 6, d: 3.5, h: 3.5, rh: 1.8, rc: 0xB85C38, wc: 0xE8DCC8, s: 'ok' },
        { x: 5, z: 1, w: 4, d: 3, h: 3.0, rh: 1.5, rc: 0x8B7355, wc: 0xDDD0BC, s: 'warn' },
        { x: -3, z: 6, w: 3.5, d: 2.5, h: 2.5, rh: 1.2, rc: 0x6B5B4B, wc: 0xD8CBBA, s: 'ok' },
        { x: 7, z: -5, w: 5, d: 3, h: 3.2, rh: 1.6, rc: 0xB85C38, wc: 0xE0D4C2, s: 'alert' },
      ];

      for (const b of barns) {
        const bh = terrainH(b.x, b.z);
        const grp = new THREE.Group();
        grp.position.set(b.x, bh, b.z);

        // walls
        const wallGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const wallMat = new THREE.MeshStandardMaterial({ color: b.wc, roughness: 0.85, metalness: 0.02 });
        const walls = new THREE.Mesh(wallGeo, wallMat);
        walls.position.y = b.h / 2;
        walls.castShadow = true;
        walls.receiveShadow = true;
        grp.add(walls);

        // gabled roof (two-slope)
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-b.w / 2 - 0.3, 0);
        roofShape.lineTo(0, b.rh);
        roofShape.lineTo(b.w / 2 + 0.3, 0);
        roofShape.lineTo(-b.w / 2 - 0.3, 0);
        const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: b.d + 0.2, bevelEnabled: false });
        const roofMat = new THREE.MeshStandardMaterial({ color: b.rc, roughness: 0.7, metalness: 0.1 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, b.h, -b.d / 2 - 0.1);
        roof.castShadow = true;
        grp.add(roof);

        // door
        const doorGeo = new THREE.PlaneGeometry(1.2, 2.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.1, b.d / 2 + 0.01);
        grp.add(door);

        // status light on ridge
        const sc = statusColors[b.s] || 0x16A34A;
        const sLight = new THREE.PointLight(sc, 0.5, 8);
        sLight.position.set(0, b.h + b.rh + 0.5, 0);
        grp.add(sLight);
        const dotGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: sc });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(sLight.position);
        grp.add(dot);

        // teal edge wireframe
        const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w + 0.1, b.h + 0.1, b.d + 0.1));
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x14B8A6, transparent: true, opacity: 0.08 });
        const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
        edgeLine.position.y = b.h / 2;
        grp.add(edgeLine);

        scene.add(grp);
      }

      /* ═══ CATTLE — recognizable low-poly cows ═══ */
      interface CowData { grp: any; tx: number; tz: number; speed: number; timer: number }
      const cattle: CowData[] = [];
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.9 });

      for (let i = 0; i < 18; i++) {
        const cx = -8 + rand() * 16;
        const cz = -8 + rand() * 16;
        const ch = terrainH(cx, cz);
        const grp = new THREE.Group();
        const isWhite = rand() > 0.5;

        // body (horizontal cylinder)
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.8, 8);
        bodyGeo.rotateZ(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isWhite ? 0xF5F0E8 : 0x4A3728, roughness: 0.9,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        grp.add(body);

        // head
        const headGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.45, 0.55, 0);
        grp.add(head);

        // 4 legs
        const legPos = [[-0.2, 0.22, 0.12], [-0.2, 0.22, -0.12], [0.25, 0.22, 0.12], [0.25, 0.22, -0.12]];
        for (const [lx, ly, lz] of legPos) {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, ly, lz);
          grp.add(leg);
        }

        grp.position.set(cx, ch, cz);
        grp.scale.setScalar(0.8 + rand() * 0.3);
        scene.add(grp);

        cattle.push({
          grp,
          tx: cx + (rand() - 0.5) * 3,
          tz: cz + (rand() - 0.5) * 3,
          speed: 0.002 + rand() * 0.003,
          timer: Math.floor(rand() * 200),
        });
      }

      /* ═══ HELICOPTER ═══ */
      const heli = new THREE.Group();
      const heliBodyMat = new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.4, metalness: 0.6 });
      const hb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 2.0), heliBodyMat);
      heli.add(hb);
      const ht = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1.5), heliBodyMat);
      ht.position.set(0, 0.1, -1.5);
      heli.add(ht);
      const rotorGeo = new THREE.BoxGeometry(4, 0.03, 0.15);
      const rotorMat = new THREE.MeshStandardMaterial({ color: 0x14B8A6, transparent: true, opacity: 0.5, metalness: 0.8 });
      const rotor1 = new THREE.Mesh(rotorGeo, rotorMat);
      rotor1.position.y = 0.4;
      heli.add(rotor1);
      const rotor2 = new THREE.Mesh(rotorGeo.clone(), rotorMat);
      rotor2.position.y = 0.4;
      rotor2.rotation.y = Math.PI / 2;
      heli.add(rotor2);
      const heliGlow = new THREE.PointLight(0x14B8A6, 0.5, 15);
      heliGlow.position.y = -0.5;
      heli.add(heliGlow);
      const spot = new THREE.SpotLight(0x14B8A6, 0.3, 25, Math.PI / 8, 0.5);
      spot.position.y = -0.3;
      spot.target.position.set(0, -10, 0);
      heli.add(spot);
      heli.add(spot.target);
      heli.position.y = 12;
      scene.add(heli);

      /* ═══ ANIMATION ═══ */
      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        const el = clock.getElapsedTime();

        // helicopter orbit
        const oR = 14, oS = 0.15;
        heli.position.x = Math.cos(el * oS) * oR;
        heli.position.z = Math.sin(el * oS) * oR;
        heli.position.y = 10 + Math.sin(el * 0.3) * 1.2;
        heli.rotation.y = -el * oS + Math.PI / 2;
        rotor1.rotation.y = el * 15;
        rotor2.rotation.y = el * 15 + Math.PI / 2;

        // cattle movement
        for (const c of cattle) {
          c.timer++;
          const dx = c.tx - c.grp.position.x;
          const dz = c.tz - c.grp.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 0.1) {
            c.grp.position.x += (dx / dist) * c.speed;
            c.grp.position.z += (dz / dist) * c.speed;
            c.grp.rotation.y = Math.atan2(dx, dz);
          }
          c.grp.position.y = terrainH(c.grp.position.x, c.grp.position.z);
          if (c.timer > 280 + rand() * 180) {
            c.timer = 0;
            c.tx = Math.max(-12, Math.min(12, c.grp.position.x + (rand() - 0.5) * 4));
            c.tz = Math.max(-12, Math.min(12, c.grp.position.z + (rand() - 0.5) * 4));
          }
        }

        // slow camera orbit
        const ca = el * 0.025;
        camera.position.x = 28 * Math.cos(ca);
        camera.position.z = 28 * Math.sin(ca);
        camera.position.y = 20 + Math.sin(el * 0.08) * 2;
        camera.lookAt(0, 1, 0);

        // teal accent pulse
        tealAccent.intensity = 0.3 + Math.sin(el * 0.5) * 0.1;

        renderer.render(scene, camera);
      };
      animate();

      /* ═══ Resize ═══ */
      const onResize = () => {
        if (disposed || !mount) return;
        const nw = mount.clientWidth;
        const nh = Math.min(nw * 0.85, 500);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);
      (mount as any).__cleanup = () => window.removeEventListener('resize', onResize);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      }
      if ((mount as any).__cleanup) (mount as any).__cleanup();
    };
  }, [isMobile]);

  if (isMobile || webglFailed) return <MobileFallback />;

  return (
    <div ref={mountRef} className="w-full rounded-2xl overflow-hidden"
      style={{
        maxHeight: 500,
        border: '1px solid rgba(20,184,166,.08)',
        boxShadow: '0 0 80px rgba(20,184,166,.04), 0 40px 120px rgba(0,0,0,.6)',
      }}
    />
  );
}
