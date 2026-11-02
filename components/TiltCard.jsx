"use client";
import { useRef } from "react";

export default function TiltCard({ enabled = true, max = 9, children, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (!enabled) return;
    // só mouse: arrastar o dedo ou a caneta não inclina o card
    if (e.pointerType !== "mouse") return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
    el.classList.add("is-tilting");
  };
  const reset = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
    el.classList.remove("is-tilting");
  };

  return (
    <div className="tilt-wrap" onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={ref} className={`tilt-card ${className}`}>
        <div className="tilt-glare" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
