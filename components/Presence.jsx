"use client";
import { useEffect, useRef, useState } from "react";
import { discordAvatarUrl } from "../hooks/useLanyard";

const STATUS_LABEL = { online: "online", idle: "ausente", dnd: "não perturbe", offline: "offline" };
const DEV = process.env.NODE_ENV !== "production";

export default function Presence({ discordId, data, failed, fallbackAvatar, name }) {
  const [now, setNow] = useState(() => Date.now());
  const ticking = useRef(false);

  // a API só responde a cada 20s; este relógio move a barra no intervalo
  const sp = data?.listening_to_spotify ? data.spotify : null;
  const wantsTick = !!sp?.timestamps?.end;
  useEffect(() => {
    if (!wantsTick) { ticking.current = false; return; }
    ticking.current = true;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => { ticking.current = false; clearInterval(id); };
  }, [wantsTick]);

  // sem configuração
  if (!discordId) {
    if (!DEV) return null;
    return <div className="presence presence-note">presença desativada — preencha <code>discordId</code> em lib/config.js</div>;
  }

  // falhou e nunca houve dado: some em produção
  if (!data) {
    if (!DEV) return null;
    return (
      <div className="presence presence-note">
        {failed
          ? <>sem resposta do Lanyard — confira o ID e entre em <code>discord.gg/lanyard</code></>
          : <>carregando presença…</>}
      </div>
    );
  }

  const u = data.discord_user || {};
  const avatar = discordAvatarUrl(u, 128) || fallbackAvatar;
  const status = data.discord_status || "offline";
  const game = (data.activities || []).find((a) => a.type === 0);
  let line = STATUS_LABEL[status] || "offline";
  if (data.listening_to_spotify && data.spotify) line = `ouvindo ${data.spotify.song} — ${data.spotify.artist}`;
  else if (game) line = `jogando ${game.name}`;

  // progresso da faixa, de 0 a 1
  let pct = null, elapsed = 0, total = 0;
  if (sp?.timestamps?.start && sp?.timestamps?.end) {
    total = sp.timestamps.end - sp.timestamps.start;
    elapsed = Math.min(Math.max(now - sp.timestamps.start, 0), total);
    if (total > 0) pct = elapsed / total;
  }
  const mmss = (ms) => {
    const t = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  };

  return (
    <div className="presence" data-cursor="hover">
      <div className="presence-avatar">
        <img src={avatar} alt="" width="44" height="44" />
        <i className={`dot dot-${status}`} />
      </div>

      <div className="presence-text">
        <strong>{u.global_name || u.username || name}</strong>
        <span title={line}>{line}</span>
        {pct !== null && (
          <div className="sp-bar" role="progressbar" aria-label="Progresso da faixa"
               aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
            <i style={{ width: `${pct * 100}%` }} />
            <em>{mmss(elapsed)} / {mmss(total)}</em>
          </div>
        )}
      </div>

      {sp?.album_art_url
        ? <img className="sp-art" src={sp.album_art_url} alt={sp.album || ""} width="46" height="46" />
        : data.listening_to_spotify && <div className="eq" aria-hidden="true"><i /><i /><i /><i /></div>}
    </div>
  );
}
