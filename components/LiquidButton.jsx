"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// Botão "liquid metal": camadas 3D escuras com brilho metálico.
// O brilho usa @paper-design/shaders. Se o pacote não estiver instalado,
// o botão continua funcionando com o degradê escuro (nada quebra).
export default function LiquidButton({
  label = "",
  onClick,
  viewMode = "text",   // "text" | "icon"
  children,            // ícone, quando viewMode === "icon"
  ariaLabel,
  className = "",
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const shaderRef = useRef(null);
  const mount = useRef(null);
  const btnRef = useRef(null);
  const rid = useRef(0);

  const d = useMemo(() => (viewMode === "icon"
    ? { w: 46, h: 46, iw: 42, ih: 42 }
    : { w: 168, h: 46, iw: 164, ih: 42 }), [viewMode]);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const mod = await import("@paper-design/shaders");
        const { ShaderMount, liquidMetalFragmentShader } = mod;
        if (dead || !shaderRef.current || !ShaderMount) return;
        mount.current = new ShaderMount(shaderRef.current, liquidMetalFragmentShader, {
          u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.3, u_shiftBlue: 0.3,
          u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1,
          u_offsetX: 0.1, u_offsetY: -0.1,
        }, undefined, 0.6);
      } catch {
        // pacote ausente: segue sem o brilho metálico
      }
    })();
    // O ShaderMount já pausa sozinho com a aba oculta (document.hidden) e fora da tela.
    // Na desmontagem, dispose() libera o WebGL; o método não se chama destroy().
    return () => { dead = true; mount.current?.dispose?.(); mount.current = null; };
  }, []);

  const speed = (v) => mount.current?.setSpeed?.(v);

  const click = (e) => {
    speed(2.4);
    setTimeout(() => speed(hovered ? 1 : 0.6), 300);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const rp = { x: e.clientX - r.left, y: e.clientY - r.top, id: rid.current++ };
      setRipples((p) => [...p, rp]);
      setTimeout(() => setRipples((p) => p.filter((q) => q.id !== rp.id)), 600);
    }
    onClick?.();
  };

  const shift = pressed ? "translateY(1px) scale(.98)" : "translateY(0) scale(1)";

  return (
    <div className={`lq ${className}`} style={{ perspective: 1000 }}>
      <div className="lq-stack" style={{ width: d.w, height: d.h }}>
        {/* conteúdo */}
        <div className="lq-face" style={{ width: d.w, height: d.h, transform: "translateZ(20px)", zIndex: 30 }}>
          {viewMode === "icon" ? children : <span className="lq-label">{label}</span>}
        </div>

        {/* miolo escuro */}
        <div className="lq-face" style={{ width: d.w, height: d.h, transform: `translateZ(10px) ${shift}`, zIndex: 20 }}>
          <div style={{
            width: d.iw, height: d.ih, margin: 2, borderRadius: 100,
            background: "linear-gradient(180deg,#202020 0%,#000 100%)",
            boxShadow: pressed ? "inset 0 2px 4px rgba(0,0,0,.4), inset 0 1px 2px rgba(0,0,0,.3)" : "none",
            transition: "box-shadow .15s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>

        {/* aro metálico */}
        <div className="lq-face" style={{ width: d.w, height: d.h, transform: `translateZ(0) ${shift}`, zIndex: 10 }}>
          <div className={`lq-rim ${hovered ? "is-hover" : ""} ${pressed ? "is-press" : ""}`}
               style={{ width: d.w, height: d.h }}>
            <div ref={shaderRef} className="lq-shader" style={{ width: d.w, height: d.h }} />
          </div>
        </div>

        <button
          ref={btnRef} type="button" aria-label={ariaLabel || label}
          className="lq-hit" style={{ width: d.w, height: d.h }}
          onClick={click}
          onMouseEnter={() => { setHovered(true); speed(1); }}
          onMouseLeave={() => { setHovered(false); setPressed(false); speed(0.6); }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
        >
          {ripples.map((r) => (
            <span key={r.id} className="lq-ripple" style={{ left: r.x, top: r.y }} />
          ))}
        </button>
      </div>
    </div>
  );
}
