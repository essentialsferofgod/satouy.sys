"use client";
import { useEffect, useRef } from "react";

// Efeito ambiente sobre o fundo. Discreto de propósito.
// modo: "dust" (poeira flutuante) | "snow" | "rain" | "none"
const PRESETS = {
  dust:  { count: 46, size: [0.5, 1.8], vy: [-0.10, -0.26], vx: 0.10, alpha: [0.12, 0.40], blur: 5,  len: 0 },
  snow:  { count: 60, size: [1.0, 2.6], vy: [0.22, 0.55],   vx: 0.22, alpha: [0.20, 0.55], blur: 3,  len: 0 },
  rain:  { count: 80, size: [0.6, 1.1], vy: [3.2, 6.0],     vx: 0.30, alpha: [0.10, 0.28], blur: 0,  len: 14 },
};

export default function Particles({ mode = "dust" }) {
  const ref = useRef(null);

  useEffect(() => {
    const cfg = PRESETS[mode];
    const canvas = ref.current;
    if (!cfg || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf, running = true;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rnd = ([a, b]) => a + Math.random() * (b - a);
    const n = window.innerWidth < 700 ? Math.round(cfg.count * 0.45) : cfg.count;
    const ps = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: rnd(cfg.size), vy: rnd(cfg.vy), vx: (Math.random() - 0.5) * cfg.vx,
      a: rnd(cfg.alpha), ph: Math.random() * Math.PI * 2,
    }));

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.shadowColor = "rgba(255,255,255,.55)";
      ctx.shadowBlur = cfg.blur;
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.ph += 0.01;
        if (p.y < -20) { p.y = h + 10; p.x = Math.random() * w; }
        else if (p.y > h + 20) { p.y = -10; p.x = Math.random() * w; }
        if (p.x < -20) p.x = w + 10; else if (p.x > w + 20) p.x = -10;
        const a = p.a * (0.65 + 0.35 * Math.sin(p.ph));
        ctx.strokeStyle = ctx.fillStyle = `rgba(255,255,255,${a})`;
        if (cfg.len) {
          ctx.lineWidth = p.r;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - cfg.len); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  if (mode === "none") return null;
  return <canvas ref={ref} className="particles-canvas" aria-hidden="true" />;
}
