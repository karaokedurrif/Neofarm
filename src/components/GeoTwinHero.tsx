'use client';

import { useEffect, useRef } from 'react';

export default function GeoTwinHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pCanvas = particleRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !pCanvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    const pCtx = pCanvas.getContext('2d');
    if (!ctx || !pCtx) return;

    // Local non-null aliases for TypeScript strict mode
    const cvs = canvas;
    const pcvs = pCanvas;
    const container = wrap;
    const c2d = ctx;
    const pc2d = pCtx;

    let raf = 0;
    let disposed = false;

    /* ─── Perlin-like noise ─── */
    function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function mix(a: number, b: number, t: number) { return a + (b - a) * t; }
    function dot2(g: number[], x: number, y: number) { return g[0] * x + g[1] * y; }
    const grads = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    function grad2(h: number) { return grads[h % 8]; }

    const p = new Uint8Array(512);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (i * 1664525 + 1013904223) % 256;
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 256; i++) p[256 + i] = p[i];

    function noise(x: number, y: number) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      const u = fade(x), v = fade(y);
      return mix(
        mix(dot2(grad2(p[(p[X] + Y) & 255]), x, y),
            dot2(grad2(p[(p[X + 1] + Y) & 255]), x - 1, y), u),
        mix(dot2(grad2(p[(p[X] + Y + 1) & 255]), x, y - 1),
            dot2(grad2(p[(p[X + 1] + Y + 1) & 255]), x - 1, y - 1), u),
        v
      );
    }

    function fbm(x: number, y: number, octaves = 6) {
      let v = 0, a = 0.5, f = 1;
      for (let i = 0; i < octaves; i++) { v += a * noise(x * f, y * f); a *= 0.5; f *= 2.1; }
      return v;
    }

    /* ─── Terrain grid ─── */
    const GRID = 48;
    const heightMap: number[][] = [];

    function buildHeightMap() {
      for (let r = 0; r <= GRID; r++) {
        heightMap[r] = [];
        for (let c = 0; c <= GRID; c++) {
          const nx = c / GRID * 4.2 + 0.4;
          const ny = r / GRID * 4.2 + 0.7;
          let h = fbm(nx, ny, 7);
          h += 0.15 * Math.sin(nx * 1.2) * Math.cos(ny * 0.8);
          heightMap[r][c] = (h + 0.8) / 1.6;
        }
      }
    }

    /* ─── Parcel polygon (normalised 0-1) ─── */
    const parcelPoly = [
      [0.18, 0.22], [0.55, 0.14], [0.78, 0.20], [0.82, 0.52],
      [0.70, 0.74], [0.45, 0.82], [0.20, 0.75], [0.10, 0.50]
    ];

    /* ─── IoT sensor positions ─── */
    const iotPositions = [
      [0.25,0.30],[0.45,0.22],[0.65,0.28],[0.75,0.38],
      [0.72,0.58],[0.55,0.68],[0.38,0.72],[0.22,0.62],
      [0.35,0.45],[0.55,0.45],[0.65,0.50],[0.48,0.35]
    ];

    /* ─── Animals (small moving dots) ─── */
    interface Animal { x: number; y: number; tx: number; ty: number; speed: number; trail: {x:number;y:number}[]; }
    const animals: Animal[] = [];
    for (let i = 0; i < 15; i++) {
      const x = 0.2 + Math.random() * 0.6;
      const y = 0.2 + Math.random() * 0.6;
      animals.push({ x, y, tx: x + (Math.random() - 0.5) * 0.1, ty: y + (Math.random() - 0.5) * 0.1, speed: 0.0003 + Math.random() * 0.0004, trail: [] });
    }

    let ndviAlpha = 0;
    let parcelAlpha = 0;
    let sceneTime = 0;

    function isoProject(c: number, r: number, h: number, cx: number, cy: number, tileW: number, tileH: number, maxH: number) {
      const isoX = (c - r) * (tileW / 2);
      const isoY = (c + r) * (tileH / 4);
      const elevPx = h * maxH;
      return { x: cx + isoX, y: cy + isoY - elevPx };
    }

    /* ─── Draw Scene ─── */
    function drawScene() {
      const W = cvs.width, H = cvs.height;
      c2d.clearRect(0, 0, W, H);

      // Background gradient
      const bgGrad = c2d.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.7);
      bgGrad.addColorStop(0, '#141620');
      bgGrad.addColorStop(0.5, '#0e0f14');
      bgGrad.addColorStop(1, '#090a0e');
      c2d.fillStyle = bgGrad;
      c2d.fillRect(0, 0, W, H);

      const tileW = Math.min(W, H) * 0.032;
      const tileH = tileW * 0.52;
      const maxH = tileW * 2.8;
      const cx = W * 0.52;
      const cy = H * 0.40;

      // Pre-compute projected vertices
      const verts: { x: number; y: number }[][] = [];
      for (let r = 0; r <= GRID; r++) {
        verts[r] = [];
        for (let c = 0; c <= GRID; c++) {
          verts[r][c] = isoProject(c, r, heightMap[r][c], cx, cy, tileW, tileH, maxH);
        }
      }

      // Draw terrain tiles
      for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
          const h00 = heightMap[r][c], h10 = heightMap[r][c + 1];
          const h01 = heightMap[r + 1][c], h11 = heightMap[r + 1][c + 1];
          const avgH = (h00 + h10 + h01 + h11) / 4;

          // Agricultural palette
          const t = avgH;
          let topR: number, topG: number, topB: number;
          if (t < 0.32) {
            topR = Math.round(mix(42, 68, t / 0.32));
            topG = Math.round(mix(36, 56, t / 0.32));
            topB = Math.round(mix(28, 42, t / 0.32));
          } else if (t < 0.52) {
            const tt = (t - 0.32) / 0.2;
            topR = Math.round(mix(68, 148, tt));
            topG = Math.round(mix(56, 118, tt));
            topB = Math.round(mix(42, 70, tt));
          } else if (t < 0.72) {
            const tt = (t - 0.52) / 0.2;
            topR = Math.round(mix(148, 176, tt));
            topG = Math.round(mix(118, 145, tt));
            topB = Math.round(mix(70, 85, tt));
          } else {
            const tt = (t - 0.72) / 0.28;
            topR = Math.round(mix(176, 210, tt));
            topG = Math.round(mix(145, 168, tt));
            topB = Math.round(mix(85, 98, tt));
          }

          // Lighting
          const dh_dx = h10 - h00;
          const dh_dy = h01 - h00;
          const light = Math.max(0.3, Math.min(1.0, 0.68 + dh_dx * 1.4 - dh_dy * 0.9));
          const shadow = Math.max(0.0, Math.min(0.25, -dh_dx * 0.8 + dh_dy * 0.5));
          const lf = light - shadow;
          topR = Math.round(topR * lf);
          topG = Math.round(topG * lf);
          topB = Math.round(topB * lf);

          // NDVI overlay
          let ndviR = 0, ndviG = 0, ndviB = 0, ndviA = 0;
          if (ndviAlpha > 0) {
            const ndvi = Math.max(-0.1, Math.min(1.0, avgH * 0.9 + 0.1 + fbm(c / 12, r / 12, 3) * 0.2 - 0.1));
            if (ndvi > 0.1) {
              if (ndvi < 0.4) { const nn = (ndvi - 0.1) / 0.3; ndviR = Math.round(mix(200, 180, nn)); ndviG = Math.round(mix(160, 190, nn)); ndviB = 0; }
              else if (ndvi < 0.65) { const nn = (ndvi - 0.4) / 0.25; ndviR = Math.round(mix(180, 80, nn)); ndviG = Math.round(mix(190, 160, nn)); ndviB = 0; }
              else { const nn = (ndvi - 0.65) / 0.35; ndviR = Math.round(mix(80, 30, nn)); ndviG = Math.round(mix(160, 120, nn)); ndviB = Math.round(mix(0, 30, nn)); }
              ndviA = ndviAlpha * 0.48;
            }
          }

          const fr = Math.round(topR * (1 - ndviA) + ndviR * ndviA);
          const fg = Math.round(topG * (1 - ndviA) + ndviG * ndviA);
          const fb = Math.round(topB * (1 - ndviA) + ndviB * ndviA);

          const v00 = verts[r][c], v10 = verts[r][c + 1];
          const v01 = verts[r + 1][c], v11 = verts[r + 1][c + 1];

          // Top face
          c2d.beginPath();
          c2d.moveTo(v00.x, v00.y);
          c2d.lineTo(v10.x, v10.y);
          c2d.lineTo(v11.x, v11.y);
          c2d.lineTo(v01.x, v01.y);
          c2d.closePath();
          c2d.fillStyle = `rgb(${fr},${fg},${fb})`;
          c2d.fill();

          // Edge lines (very subtle)
          if (r === 0 || c === 0 || r === GRID - 1 || c === GRID - 1) {
            c2d.strokeStyle = 'rgba(0,0,0,0.12)';
            c2d.lineWidth = 0.3;
            c2d.stroke();
          }

          // South face (geological cross-section)
          if (r === GRID - 1) {
            const baseY = cy + (c + GRID + 1) * tileH / 4 + 20;
            c2d.beginPath();
            c2d.moveTo(v01.x, v01.y);
            c2d.lineTo(v11.x, v11.y);
            c2d.lineTo(v11.x, baseY);
            c2d.lineTo(v01.x, baseY);
            c2d.closePath();
            const layerGrad = c2d.createLinearGradient(0, v01.y, 0, baseY);
            layerGrad.addColorStop(0, 'rgba(72,54,38,0.92)');
            layerGrad.addColorStop(0.18, 'rgba(110,72,45,0.92)');
            layerGrad.addColorStop(0.45, 'rgba(130,88,58,0.88)');
            layerGrad.addColorStop(0.72, 'rgba(80,62,50,0.92)');
            layerGrad.addColorStop(1, 'rgba(24,22,28,0.98)');
            c2d.fillStyle = layerGrad;
            c2d.fill();
            c2d.strokeStyle = 'rgba(0,0,0,0.4)';
            c2d.lineWidth = 0.5;
            c2d.stroke();
          }

          // East face
          if (c === GRID - 1) {
            const baseY = cy + (c + 1 + r) * tileH / 4 + 20;
            c2d.beginPath();
            c2d.moveTo(v10.x, v10.y);
            c2d.lineTo(v11.x, v11.y);
            c2d.lineTo(v11.x, baseY);
            c2d.lineTo(v10.x, baseY);
            c2d.closePath();
            const layerGrad2 = c2d.createLinearGradient(0, v10.y, 0, baseY);
            layerGrad2.addColorStop(0, 'rgba(56,42,30,0.88)');
            layerGrad2.addColorStop(0.3, 'rgba(90,60,38,0.85)');
            layerGrad2.addColorStop(0.7, 'rgba(65,50,40,0.90)');
            layerGrad2.addColorStop(1, 'rgba(20,18,24,0.98)');
            c2d.fillStyle = layerGrad2;
            c2d.fill();
            c2d.strokeStyle = 'rgba(0,0,0,0.3)';
            c2d.lineWidth = 0.4;
            c2d.stroke();
          }
        }
      }

      // ── Parcel polygon ──
      if (parcelAlpha > 0) {
        c2d.save();
        c2d.beginPath();
        parcelPoly.forEach((pt, i) => {
          const pc = pt[0] * GRID, pr = pt[1] * GRID;
          const hc = Math.min(Math.floor(pc), GRID), hr = Math.min(Math.floor(pr), GRID);
          const h = heightMap[hr]?.[hc] ?? 0.5;
          const proj = isoProject(pc, pr, h + 0.06, cx, cy, tileW, tileH, maxH);
          if (i === 0) c2d.moveTo(proj.x, proj.y);
          else c2d.lineTo(proj.x, proj.y);
        });
        c2d.closePath();
        c2d.fillStyle = `rgba(20, 184, 166, ${0.09 * parcelAlpha})`;
        c2d.fill();
        c2d.strokeStyle = `rgba(200, 168, 75, ${0.85 * parcelAlpha})`;
        c2d.lineWidth = 1.5;
        c2d.setLineDash([8, 4]);
        c2d.lineDashOffset = -sceneTime * 0.015;
        c2d.stroke();
        c2d.setLineDash([]);
        c2d.restore();
      }

      // ── Trees ──
      const trees = [[0.28,0.18],[0.62,0.16],[0.72,0.40],[0.30,0.60],[0.50,0.52],[0.15,0.40]];
      trees.forEach(([tc, tr]) => {
        const pc = tc * GRID, pr = tr * GRID;
        const rc = Math.min(Math.floor(pr), GRID), cc = Math.min(Math.floor(pc), GRID);
        const h = heightMap[rc]?.[cc] ?? 0.5;
        const base = isoProject(pc, pr, h, cx, cy, tileW, tileH, maxH);
        const top = isoProject(pc, pr, h + 0.18, cx, cy, tileW, tileH, maxH);

        // Shadow
        c2d.beginPath();
        c2d.ellipse(base.x + tileW * 0.4, base.y + tileH * 0.2, tileW * 0.8, tileH * 0.35, 0, 0, Math.PI * 2);
        c2d.fillStyle = 'rgba(0,0,0,0.18)';
        c2d.fill();

        // Crown
        const radius = tileW * 0.7;
        const crownGrad = c2d.createRadialGradient(top.x - radius * 0.25, top.y - radius * 0.3, 0, top.x, top.y, radius);
        crownGrad.addColorStop(0, 'rgba(72,110,56,0.95)');
        crownGrad.addColorStop(0.5, 'rgba(52,82,40,0.92)');
        crownGrad.addColorStop(1, 'rgba(32,52,24,0.88)');
        c2d.beginPath();
        c2d.ellipse(top.x, top.y, radius, radius * 0.65, 0, 0, Math.PI * 2);
        c2d.fillStyle = crownGrad;
        c2d.fill();
      });

      // ── Animals (moving dots with trails) ──
      animals.forEach((a) => {
        // Move toward target
        const dx = a.tx - a.x, dy = a.ty - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.005) {
          a.tx = Math.max(0.15, Math.min(0.85, a.x + (Math.random() - 0.5) * 0.12));
          a.ty = Math.max(0.15, Math.min(0.85, a.y + (Math.random() - 0.5) * 0.12));
        } else {
          a.x += (dx / dist) * a.speed;
          a.y += (dy / dist) * a.speed;
        }
        a.trail.push({ x: a.x, y: a.y });
        if (a.trail.length > 20) a.trail.shift();

        // Draw trail
        if (a.trail.length > 2) {
          c2d.beginPath();
          a.trail.forEach((tp, i) => {
            const pc = tp.x * GRID, pr = tp.y * GRID;
            const rc = Math.min(Math.floor(pr), GRID), cc = Math.min(Math.floor(pc), GRID);
            const h = heightMap[rc]?.[cc] ?? 0.5;
            const proj = isoProject(pc, pr, h + 0.03, cx, cy, tileW, tileH, maxH);
            if (i === 0) c2d.moveTo(proj.x, proj.y);
            else c2d.lineTo(proj.x, proj.y);
          });
          c2d.strokeStyle = 'rgba(255,255,255,0.06)';
          c2d.lineWidth = 0.6;
          c2d.stroke();
        }

        // Draw animal dot
        const pc = a.x * GRID, pr = a.y * GRID;
        const rc = Math.min(Math.floor(pr), GRID), cc = Math.min(Math.floor(pc), GRID);
        const h = heightMap[rc]?.[cc] ?? 0.5;
        const proj = isoProject(pc, pr, h + 0.04, cx, cy, tileW, tileH, maxH);
        c2d.beginPath();
        c2d.arc(proj.x, proj.y, tileW * 0.15, 0, Math.PI * 2);
        c2d.fillStyle = 'rgba(240,235,220,0.85)';
        c2d.fill();
      });

      // ── IoT nodes ──
      iotPositions.forEach((pos, i) => {
        const pc = pos[0] * GRID, pr = pos[1] * GRID;
        const rc = Math.min(Math.floor(pr), GRID), cc = Math.min(Math.floor(pc), GRID);
        const h = heightMap[rc]?.[cc] ?? 0.5;
        const proj = isoProject(pc, pr, h + 0.04, cx, cy, tileW, tileH, maxH);

        const pulse = Math.sin(sceneTime * 0.04 + i * 0.8) * 0.5 + 0.5;
        const baseRadius = tileW * 0.18;
        const isWarning = i === 3;

        // Pulse ring
        const ringR = baseRadius * (1.5 + pulse * 1.2);
        c2d.beginPath();
        c2d.arc(proj.x, proj.y, ringR, 0, Math.PI * 2);
        c2d.strokeStyle = isWarning
          ? `rgba(200,168,75,${0.35 * (1 - pulse)})`
          : `rgba(20,184,166,${0.4 * (1 - pulse)})`;
        c2d.lineWidth = 0.8;
        c2d.stroke();

        // Node body
        c2d.beginPath();
        c2d.arc(proj.x, proj.y, baseRadius, 0, Math.PI * 2);
        c2d.fillStyle = 'rgba(225,225,232,0.92)';
        c2d.fill();

        // LED dot
        c2d.beginPath();
        c2d.arc(proj.x, proj.y, baseRadius * 0.38, 0, Math.PI * 2);
        c2d.fillStyle = isWarning
          ? `rgba(200,168,75,${0.7 + pulse * 0.3})`
          : `rgba(20,184,166,${0.7 + pulse * 0.3})`;
        c2d.fill();

        // Connection lines
        if (i < iotPositions.length - 1) {
          const next = iotPositions[(i + 2) % iotPositions.length];
          const nc = next[0] * GRID, nr = next[1] * GRID;
          const nrc = Math.min(Math.floor(nr), GRID), ncc = Math.min(Math.floor(nc), GRID);
          const nh = heightMap[nrc]?.[ncc] ?? 0.5;
          const nproj = isoProject(nc, nr, nh + 0.04, cx, cy, tileW, tileH, maxH);
          c2d.beginPath();
          c2d.moveTo(proj.x, proj.y);
          c2d.lineTo(nproj.x, nproj.y);
          c2d.strokeStyle = 'rgba(20,184,166,0.12)';
          c2d.lineWidth = 0.6;
          c2d.setLineDash([3, 5]);
          c2d.stroke();
          c2d.setLineDash([]);
        }
      });

      // ── GPS routes (animated dashes) ──
      const routes = [
        [[0.25,0.30],[0.35,0.45],[0.55,0.45],[0.65,0.28]],
        [[0.22,0.62],[0.38,0.72],[0.55,0.68],[0.72,0.58]],
      ];
      routes.forEach((route) => {
        c2d.beginPath();
        route.forEach((pt, i) => {
          const pc = pt[0] * GRID, pr = pt[1] * GRID;
          const rc = Math.min(Math.floor(pr), GRID), cc = Math.min(Math.floor(pc), GRID);
          const h = heightMap[rc]?.[cc] ?? 0.5;
          const proj = isoProject(pc, pr, h + 0.05, cx, cy, tileW, tileH, maxH);
          if (i === 0) c2d.moveTo(proj.x, proj.y);
          else c2d.lineTo(proj.x, proj.y);
        });
        c2d.strokeStyle = 'rgba(20,184,166,0.22)';
        c2d.lineWidth = 1;
        c2d.setLineDash([6, 4]);
        c2d.lineDashOffset = -sceneTime * 0.03;
        c2d.stroke();
        c2d.setLineDash([]);
      });

      // ── Fog at edges ──
      const fogGrad = c2d.createLinearGradient(0, cy - 50, 0, cy + GRID * tileH / 2);
      fogGrad.addColorStop(0, 'rgba(14,15,20,0.0)');
      fogGrad.addColorStop(0.8, 'rgba(14,15,20,0.0)');
      fogGrad.addColorStop(1, 'rgba(10,11,15,0.6)');
      c2d.fillStyle = fogGrad;
      c2d.fillRect(0, 0, W, H);
    }

    /* ─── Particles ─── */
    const NUM_PARTICLES = 40;
    interface Particle { x: number; y: number; size: number; vx: number; vy: number; alpha: number; life: number; }
    let particles: Particle[] = [];

    function initParticles() {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      pcvs.width = rect.width * dpr;
      pcvs.height = rect.height * dpr;
      pcvs.style.width = rect.width + 'px';
      pcvs.style.height = rect.height + 'px';
      pc2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = [];
      for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: 0.4 + Math.random() * 1.1,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.04 - Math.random() * 0.12,
          alpha: 0.1 + Math.random() * 0.35,
          life: Math.random()
        });
      }
    }

    function animateParticles() {
      const w = pcvs.width / (window.devicePixelRatio || 1);
      const h = pcvs.height / (window.devicePixelRatio || 1);
      pc2d.clearRect(0, 0, w, h);
      particles.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life += 0.002;
        if (pt.y < -5 || pt.life > 1) {
          pt.y = h + 5;
          pt.x = Math.random() * w;
          pt.life = 0;
        }
        const a = pt.alpha * Math.sin(pt.life * Math.PI);
        pc2d.beginPath();
        pc2d.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        pc2d.fillStyle = `rgba(212,197,168,${a})`;
        pc2d.fill();
      });
    }

    /* ─── Resize ─── */
    function resize() {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cvs.width = rect.width * dpr;
      cvs.height = rect.height * dpr;
      cvs.style.width = rect.width + 'px';
      cvs.style.height = rect.height + 'px';
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene();
    }

    /* ─── Animation loop ─── */
    function animate() {
      if (disposed) return;
      sceneTime++;
      if (sceneTime > 30) ndviAlpha = Math.min(1, ndviAlpha + 0.012);
      if (sceneTime > 60) parcelAlpha = Math.min(1, parcelAlpha + 0.018);
      drawScene();
      animateParticles();
      raf = requestAnimationFrame(animate);
    }

    /* ─── Init ─── */
    buildHeightMap();
    resize();
    initParticles();
    raf = requestAnimationFrame(animate);

    const onResize = () => { resize(); initParticles(); };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ aspectRatio: '1.2/1', maxHeight: '500px' }}>
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(20,184,166,.1)',
          boxShadow: '0 0 60px rgba(20,184,166,.04), 0 30px 80px rgba(0,0,0,.5)',
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <canvas ref={particleRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }} />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(11,12,15,0.65) 100%)' }}
        />
      </div>
    </div>
  );
}
