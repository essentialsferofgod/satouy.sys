"use client";
import { useEffect, useRef, useState } from "react";
import LiquidButton from "./LiquidButton";

const fmt = (s) => (!isFinite(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`);

export default function MusicPlayer({ tracks, autoStart }) {
  const audio = useRef(null);
  const viz = useRef(null);
  const ctxRef = useRef(null);
  const analyser = useRef(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [volume, setVolume] = useState(0.6);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const track = tracks[idx];

  // Web Audio só pode ser criado depois de um gesto do usuário.
  const ensureAnalyser = () => {
    if (ctxRef.current || !audio.current) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audio.current);
      const an = ctx.createAnalyser();
      an.fftSize = 64;
      src.connect(an); an.connect(ctx.destination);
      ctxRef.current = ctx; analyser.current = an;
    } catch { /* sem visualizador, o áudio continua funcionando */ }
  };

  const play = async () => {
    const a = audio.current; if (!a || !track) return;
    ensureAnalyser();
    try { await ctxRef.current?.resume(); await a.play(); setFailed(false); } catch { setPlaying(false); }
  };
  const toggle = () => (audio.current.paused ? play() : audio.current.pause());
  const go = (i) => {
    const next = (i + tracks.length) % tracks.length;
    // Com uma faixa só, o índice não muda e o efeito não dispara:
    // reinicia o áudio na mão para o loop e o "próxima" continuarem funcionando.
    if (next === idx) {
      const a = audio.current;
      if (a) { a.currentTime = 0; play(); }
      return;
    }
    setIdx(next); setTime({ cur: 0, dur: 0 });
  };

  // troca de faixa: se estava tocando, continua tocando
  useEffect(() => {
    const a = audio.current; if (!a) return;
    a.load();
    if (playing || autoStart) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);

  // visualizador
  useEffect(() => {
    const c = viz.current; if (!c) return;
    const g = c.getContext("2d"); let raf;
    let running = document.visibilityState === "visible";
    const data = new Uint8Array(32);
    const draw = () => {
      if (!running) return;
      g.clearRect(0, 0, c.width, c.height);
      if (analyser.current && playing) analyser.current.getByteFrequencyData(data); else data.fill(0);
      const bw = c.width / 16;
      for (let i = 0; i < 16; i++) {
        const v = Math.max(0.06, data[i] / 255), h = v * c.height;
        g.fillStyle = `rgba(255,${200 - i * 6},${150 + i * 4},${0.45 + v * 0.55})`;
        g.fillRect(i * bw + 1, c.height - h, bw - 3, h);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // aba oculta: para de desenhar
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(draw); else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [playing]);

  // desmontou: fecha o AudioContext
  useEffect(() => () => {
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null; analyser.current = null;
  }, []);

  if (!tracks.length) return null;

  return (
    <div className={`player ${open ? "player-open" : ""}`}>
      <audio ref={audio} src={track.src} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime({ cur: e.target.currentTime, dur: e.target.duration })}
        onLoadedMetadata={(e) => setTime({ cur: 0, dur: e.target.duration })}
        onEnded={() => go(idx + 1)}
        onError={() => { setFailed(true); setPlaying(false); }} />

      <div className="player-row">
        <button className="icon-btn" onClick={() => go(idx - 1)} aria-label="Faixa anterior">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h2v12H6zM20 6v12L9.5 12z" /></svg>
        </button>
        <LiquidButton viewMode="icon" onClick={toggle} ariaLabel={playing ? "Pausar" : "Tocar"}>
          {playing
            ? <svg viewBox="0 0 24 24" width="17" height="17" fill="#d8d8d8"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            : <svg viewBox="0 0 24 24" width="17" height="17" fill="#d8d8d8"><path d="M7 4.5v15L19 12z" /></svg>}
        </LiquidButton>
        <button className="icon-btn" onClick={() => go(idx + 1)} aria-label="Próxima faixa">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 6h2v12h-2zM4 6l10.5 6L4 18z" /></svg>
        </button>
        <div className="player-meta" title={track.title}>
          <b>{track.title}</b>
          <span>{failed ? "arquivo não encontrado em /public/music" : track.artist}</span>
        </div>
        <canvas ref={viz} className="viz" width="64" height="26" aria-hidden="true" />
        <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Playlist e volume" aria-expanded={open}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 6h14v2H3zM3 11h14v2H3zM3 16h9v2H3zM19 11v6.2A2.5 2.5 0 1 0 21 19v-6h2v-2z" /></svg>
        </button>
      </div>

      {open && (
        <div className="player-more">
          <div className="seek">
            <span>{fmt(time.cur)}</span>
            <input type="range" min="0" max={time.dur || 0} step="0.1" value={time.cur}
              onChange={(e) => { audio.current.currentTime = +e.target.value; }} aria-label="Progresso" />
            <span>{fmt(time.dur)}</span>
          </div>
          <div className="seek">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9zM16 8.5a5 5 0 0 1 0 7" /></svg>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(+e.target.value)} aria-label="Volume" />
          </div>
          <ul className="tracklist">
            {tracks.map((t, i) => (
              <li key={t.src}>
                <button className={i === idx ? "on" : ""} onClick={() => {
                  if (i === idx) { const a = audio.current; if (a) a.currentTime = 0; play(); }
                  else { setIdx(i); setPlaying(true); }
                }}>
                  {t.title} <small>{t.artist}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
