'use client';

import { useRef, useEffect, useState } from 'react';

function toIso(x: number, y: number, tileW: number, tileH: number, offsetX: number, offsetY: number) {
  return { px: (x - y) * (tileW / 2) + offsetX, py: (x + y) * (tileH / 2) + offsetY };
}

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

interface Cow { dx: number; dy: number; vx: number; vy: number; color: string }
interface Tree { dx: number; dy: number; r: number }
interface Parcel { gx: number; gy: number; ndvi: number; active: boolean; trees: Tree[]; cattle: Cow[] }
interface Bldg { gx: number; gy: number; w: number; h: number; height: number; color: string }
interface DCard { x: number; y: number; label: string; value: string; unit: string; delay: number }

export default function GeotwinCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const maybeCtx = cvs.getContext('2d');
    if (!maybeCtx) return;
    const c: CanvasRenderingContext2D = maybeCtx;
    const canvas: HTMLCanvasElement = cvs;

    let animId = 0;
    const t0 = performance.now();
    const rand = seeded(42);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const GRID = mobile ? 6 : 8;
    const tileW = mobile ? 56 : 72;
    const tileH = tileW / 2;

    const parcels: Parcel[] = [];
    for (let gx = 0; gx < GRID; gx++) {
      for (let gy = 0; gy < GRID; gy++) {
        const active = rand() > 0.25;
        const ndvi = active ? 0.4 + rand() * 0.6 : 0.05 + rand() * 0.2;
        const trees: Tree[] = [];
        if (active && rand() > 0.4) {
          for (let i = 0; i < Math.floor(rand() * 4) + 1; i++)
            trees.push({ dx: (rand() - 0.5) * tileW * 0.6, dy: (rand() - 0.5) * tileH * 0.6, r: 3 + rand() * 4 });
        }
        const cattle: Cow[] = [];
        if (active && rand() > 0.5) {
          for (let i = 0; i < Math.floor(rand() * 4) + 1; i++)
            cattle.push({ dx: (rand() - 0.5) * tileW * 0.5, dy: (rand() - 0.5) * tileH * 0.5, vx: (rand() - 0.5) * 0.15, vy: (rand() - 0.5) * 0.1, color: rand() > 0.5 ? '#f5f0e8' : '#8b7355' });
        }
        parcels.push({ gx, gy, ndvi, active, trees, cattle });
      }
    }

    const buildings: Bldg[] = [
      { gx: 1, gy: 1, w: 1.3, h: 0.6, height: 18, color: '#2a3040' },
      { gx: 5, gy: 2, w: 1.5, h: 0.7, height: 22, color: '#252d3a' },
      { gx: 3, gy: 6, w: 1.2, h: 0.5, height: 15, color: '#2e3545' },
    ];

    const dataCards: DCard[] = [
      { x: 0.12, y: 0.15, label: 'NDVI', value: '0.72', unit: '', delay: 0 },
      { x: 0.75, y: 0.2, label: 'TEMP', value: '23.4', unit: '°C', delay: 0.3 },
      { x: 0.15, y: 0.72, label: 'HEAD', value: '847', unit: '', delay: 0.6 },
      { x: 0.78, y: 0.75, label: 'CO₂', value: '412', unit: 'ppm', delay: 0.9 },
    ];

    function ndviCol(v: number, a = 1): string {
      if (v < 0.3) return `rgba(139,115,85,${a})`;
      if (v < 0.5) return `rgba(107,130,75,${a})`;
      if (v < 0.7) return `rgba(60,120,60,${a})`;
      return `rgba(34,100,50,${a})`;
    }

    function tile(cx: number, cy: number, tw: number, th: number) {
      c.beginPath();
      c.moveTo(cx, cy - th / 2);
      c.lineTo(cx + tw / 2, cy);
      c.lineTo(cx, cy + th / 2);
      c.lineTo(cx - tw / 2, cy);
      c.closePath();
    }

    function render(now: number) {
      const el = (now - t0) / 1000;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const offX = w / 2;
      const offY = h * 0.32;

      c.clearRect(0, 0, w, h);
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#070A0F');
      bg.addColorStop(1, '#0B1220');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      const dayP = (Math.sin(el * 0.105) + 1) / 2;
      const tR = Math.round(dayP * 15);
      const tB = Math.round((1 - dayP) * 10);

      // Parcels
      for (const p of parcels) {
        const { px, py } = toIso(p.gx, p.gy, tileW, tileH, offX, offY);
        const hOff = Math.sin(p.gx * 0.7 + p.gy * 0.5) * 4;
        const aP = Math.min(el / 2, 1);
        const cN = p.ndvi * aP;

        tile(px, py - hOff, tileW - 2, tileH - 1);
        c.fillStyle = ndviCol(cN, 0.7);
        c.fill();
        c.strokeStyle = 'rgba(20,184,166,0.08)';
        c.lineWidth = 0.5;
        c.stroke();

        for (const tr of p.trees) {
          const tx = px + tr.dx, ty = py - hOff + tr.dy - tr.r;
          c.beginPath();
          c.ellipse(tx + 2, ty + tr.r + 2, tr.r * 0.8, tr.r * 0.3, 0, 0, Math.PI * 2);
          c.fillStyle = 'rgba(0,0,0,0.2)';
          c.fill();
          c.beginPath();
          c.arc(tx, ty, tr.r, 0, Math.PI * 2);
          c.fillStyle = `rgba(30,${70 + Math.round(cN * 40)},35,0.8)`;
          c.fill();
        }

        for (const cow of p.cattle) {
          cow.dx += cow.vx + Math.sin(el + cow.dx) * 0.02;
          cow.dy += cow.vy + Math.cos(el + cow.dy) * 0.01;
          const mD = tileW * 0.3, mH = tileH * 0.3;
          if (Math.abs(cow.dx) > mD) cow.vx *= -1;
          if (Math.abs(cow.dy) > mH) cow.vy *= -1;
          cow.dx = Math.max(-mD, Math.min(mD, cow.dx));
          cow.dy = Math.max(-mH, Math.min(mH, cow.dy));
          c.beginPath();
          c.arc(px + cow.dx, py - hOff + cow.dy, 2, 0, Math.PI * 2);
          c.fillStyle = cow.color;
          c.fill();
        }
      }

      // Buildings
      for (const b of buildings) {
        const { px, py } = toIso(b.gx, b.gy, tileW, tileH, offX, offY);
        const bw = tileW * b.w, bh = tileH * b.h;

        tile(px, py, bw, bh);
        c.fillStyle = b.color;
        c.fill();
        c.strokeStyle = 'rgba(20,184,166,.1)';
        c.lineWidth = 0.5;
        c.stroke();

        tile(px, py - b.height, bw, bh);
        const rg = c.createLinearGradient(px, py - b.height - bh / 2, px, py - b.height + bh / 2);
        rg.addColorStop(0, '#3a4560');
        rg.addColorStop(1, '#252d3a');
        c.fillStyle = rg;
        c.fill();
        c.strokeStyle = 'rgba(20,184,166,.12)';
        c.stroke();

        c.beginPath();
        c.moveTo(px - bw / 2, py);
        c.lineTo(px - bw / 2, py - b.height);
        c.lineTo(px, py - b.height + bh / 2);
        c.lineTo(px, py + bh / 2);
        c.closePath();
        c.fillStyle = 'rgba(20,25,35,.9)';
        c.fill();

        c.beginPath();
        c.moveTo(px + bw / 2, py);
        c.lineTo(px + bw / 2, py - b.height);
        c.lineTo(px, py - b.height + bh / 2);
        c.lineTo(px, py + bh / 2);
        c.closePath();
        c.fillStyle = 'rgba(30,36,48,.9)';
        c.fill();
      }

      // Fog
      const fg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.min(w, h) * 0.65);
      fg.addColorStop(0, 'transparent');
      fg.addColorStop(1, 'rgba(5,5,8,0.85)');
      c.fillStyle = fg;
      c.fillRect(0, 0, w, h);

      // Data cards
      for (const dc of dataCards) {
        const cA = Math.max(0, Math.min(1, (el - dc.delay - 0.5) * 2));
        if (cA <= 0) continue;
        const cx = dc.x * w, cy = dc.y * h, cW = 72, cH = 40;
        c.globalAlpha = cA * 0.85;
        c.beginPath();
        c.roundRect(cx - cW / 2, cy - cH / 2, cW, cH, 6);
        c.fillStyle = 'rgba(11,15,20,.75)';
        c.fill();
        c.strokeStyle = 'rgba(20,184,166,.12)';
        c.lineWidth = 0.5;
        c.stroke();

        c.fillStyle = `rgba(${138 + tR},146,${164 + tB},0.7)`;
        c.font = '8px JetBrains Mono, monospace';
        c.textAlign = 'center';
        c.fillText(dc.label, cx, cy - 6);

        c.fillStyle = 'rgba(20,184,166,0.9)';
        c.font = 'bold 12px JetBrains Mono, monospace';
        c.fillText(dc.value + dc.unit, cx, cy + 10);
        c.globalAlpha = 1;
      }

      // Paths
      c.setLineDash([3, 4]);
      c.strokeStyle = 'rgba(255,255,255,.06)';
      c.lineWidth = 1;
      for (let i = 0; i < buildings.length - 1; i++) {
        const a = toIso(buildings[i].gx, buildings[i].gy, tileW, tileH, offX, offY);
        const b = toIso(buildings[i + 1].gx, buildings[i + 1].gy, tileW, tileH, offX, offY);
        c.beginPath();
        c.moveTo(a.px, a.py);
        c.lineTo(b.px, b.py);
        c.stroke();
      }
      c.setLineDash([]);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [mobile]);

  return <canvas ref={canvasRef} className="w-full" style={{ aspectRatio: '1/0.85', maxHeight: mobile ? 300 : 500 }} />;
}
