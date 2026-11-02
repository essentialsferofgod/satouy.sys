"use client";
import { useEffect, useState } from "react";

// Consulta a presença no Lanyard uma única vez para a página inteira.
// Devolve { data, failed }. data === null enquanto não houver resposta boa.
export default function useLanyard(discordId, intervalMs = 20000) {
  const [state, setState] = useState({ data: null, failed: false });

  useEffect(() => {
    if (!discordId) { setState({ data: null, failed: false }); return; }
    let alive = true, timer = null;
    const ctrl = new AbortController();

    const load = async () => {
      try {
        const r = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`, { signal: ctrl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!alive) return;
        if (j?.success && j.data) {
          setState({ data: j.data, failed: false });
          writeCachedAvatar(discordId, discordAvatarUrl(j.data.discord_user, 256));
        }
        else setState((s) => ({ data: s.data, failed: true }));   // mantém o último dado bom
      } catch (e) {
        if (e.name === "AbortError" || !alive) return;
        setState((s) => ({ data: s.data, failed: true }));
      }
      if (alive) timer = setTimeout(load, intervalMs);
    };
    load();

    return () => { alive = false; ctrl.abort(); if (timer) clearTimeout(timer); };
  }, [discordId, intervalMs]);

  return state;
}

const CACHE_KEY = "pf-avatar";

// Última foto conhecida, guardada no navegador deste visitante, para a foto
// do Discord aparecer já na abertura em vez de piscar o avatar de reserva.
export function readCachedAvatar(discordId) {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return v && v.id === String(discordId) && v.url ? v.url : null;
  } catch { return null; }
}

function writeCachedAvatar(discordId, url) {
  try {
    if (url) localStorage.setItem(CACHE_KEY, JSON.stringify({ id: String(discordId), url }));
  } catch { /* modo privado: segue sem cache */ }
}

// URL do avatar do Discord a partir da resposta. Lida com GIF animado.
export function discordAvatarUrl(user, size = 256) {
  if (!user?.id || !user?.avatar) return null;
  const ext = String(user.avatar).startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}
