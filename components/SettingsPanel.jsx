"use client";
import { useEffect, useRef, useState } from "react";

const LABELS = {
  shader: "Fundo animado",
  particles: "Partículas",
  cursor: "Cursor custom",
  tilt: "Card 3D",
};

export default function SettingsPanel({ settings, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const btn = useRef(null);

  // aberto: Escape fecha e devolve o foco ao botão; clique fora só fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    const onDown = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="settings" ref={root}>
      <button ref={btn} className="icon-btn" onClick={() => setOpen(!open)} aria-label="Configurações" aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
      </button>
      {open && (
        <div className="panel" role="dialog" aria-label="Configurações">
          {Object.keys(LABELS).map((k) => (
            <label key={k} className="switch">
              <span>{LABELS[k]}</span>
              <input type="checkbox" role="switch" checked={!!settings[k]} onChange={(e) => onChange({ ...settings, [k]: e.target.checked })} />
              <i aria-hidden="true" />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
