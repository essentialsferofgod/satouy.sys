"use client";
import { useEffect, useRef } from "react";

// Brilhos brancos em volta do texto (efeito "white sparkles").
// Desenha estrelinhas de 4 pontas que nascem, brilham e somem.
export default function SparkleText({ children, density = 14, className = "" }) {
  const wrap = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const el = wrap.current, c = canvas.current;
    if (!el || !c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const PAD = 14;
    let w = 0, h = 0, raf = 0, running = true;

    const resize = () => {
      const r = el.getBoundingClientRect();
      w = r.width + PAD * 2; h = r.height + PAD * 2;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + "px"; c.style.height = h + "px";
      c.style.left = -PAD + "px"; c.style.top = -PAD + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    // a fonte web carrega depois da montagem e muda o tamanho do texto
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const make = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 1.2 + Math.random() * 2.6,
      life: 0,
      max: 70 + Math.random() * 90,
      drift: (Math.random() - 0.5) * 0.18,
      rise: -0.06 - Math.random() * 0.12,
      spin: (Math.random() - 0.5) * 0.02,
      rot: Math.random() * Math.PI,
    });
    const stars = Array.from({ length: density }, () => { const s = make(); s.life = Math.random() * s.max; return s; });

    // estrela de 4 pontas
    const star = (x, y, r, rot, a) => {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        ctx.quadraticCurveTo(Math.cos(ang + Math.PI / 4) * r * 0.18, Math.sin(ang + Math.PI / 4) * r * 0.18,
                             Math.cos(ang + Math.PI / 2) * r, Math.sin(ang + Math.PI / 2) * r);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.shadowColor = `rgba(255,255,255,${a * 0.6})`;
      ctx.shadowBlur = r * 1.6;
      ctx.fill();
      ctx.restore();
    };

    const frame = () => {
      raf = 0;
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.life++; s.x += s.drift; s.y += s.rise; s.rot += s.spin;
        if (s.life >= s.max) { stars[i] = make(); continue; }
        const t = s.life / s.max;
        const a = Math.sin(t * Math.PI) * 0.55;          // nasce e some
        star(s.x, s.y, s.size, s.rot, a);
      }
      raf = requestAnimationFrame(frame);   // nunca para: as estrelas renascem sem fim
    };
    const start = () => { if (!raf && running) raf = requestAnimationFrame(frame); };
    start();

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) start();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <span ref={wrap} className={`sparkle-wrap ${className}`}>
      <canvas ref={canvas} className="sparkle-canvas" aria-hidden="true" />
      <span className="sparkle-content">{children}</span>
    </span>
  );
}
