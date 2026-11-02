"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // celular: sem cursor custom
    document.documentElement.classList.add("has-cursor");
    const pos = { x: -100, y: -100 }, rp = { x: -100, y: -100 };
    let raf, hover = false;
    let running = document.visibilityState === "visible";

    const move = (e) => {
      pos.x = e.clientX; pos.y = e.clientY;
      hover = !!e.target.closest?.("a, button, input, [data-cursor='hover']");
    };
    const down = () => ring.current?.classList.add("is-down");
    const up = () => ring.current?.classList.remove("is-down");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    const frame = () => {
      if (!running) return;
      rp.x += (pos.x - rp.x) * 0.18; rp.y += (pos.y - rp.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rp.x}px,${rp.y}px,0) translate(-50%,-50%)`;
        ring.current.classList.toggle("is-hover", hover);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // aba oculta: para de animar
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
