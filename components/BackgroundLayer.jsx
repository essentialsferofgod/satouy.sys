"use client";
import { useEffect, useState } from "react";
import ShaderBackground from "./ShaderBackground";
import { background } from "../lib/config";

// Camada única e intercambiável de fundo.
// O modo é escolhido em lib/config.js -> background.kind
//   "shader" | "video" | "image" | "none"
export default function BackgroundLayer({ enabled = true }) {
  const { kind = "shader", src = "", poster = "", scrim = 0.5, grain = true, vignette = true } = background || {};
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Com o fundo desligado nas configurações, ou com movimento reduzido,
  // nenhuma mídia animada é carregada.
  const mode = !enabled ? "none" : reduced && kind !== "image" ? (poster ? "image" : "none") : kind;

  return (
    <div className="bg-layer" aria-hidden="true">
      {mode === "shader" && <ShaderBackground />}

      {mode === "video" && src && (
        <video className="bg-media" src={src} poster={poster || undefined}
          autoPlay muted loop playsInline preload="metadata" />
      )}

      {mode === "image" && (src || poster) && (
        <img className="bg-media" src={src || poster} alt="" />
      )}

      {mode === "none" && <div className="bg-flat" />}

      {/* véu escuro: garante contraste do texto seja qual for a mídia */}
      <div className="bg-scrim" style={{ opacity: scrim }} />
      {vignette && <div className="bg-vignette" />}
      {grain && <div className="bg-grain" />}
    </div>
  );
}
