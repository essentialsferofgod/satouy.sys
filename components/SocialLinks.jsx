"use client";
import { ICONS } from "../lib/icons";

// Lê o caminho da URL e transforma em @usuario para o tooltip.
export function handleFromUrl(url) {
  try {
    const segs = new URL(url).pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1] || new URL(url).hostname;
    return last.startsWith("@") ? last : "@" + last;
  } catch { return ""; }
}

export default function SocialLinks({ items }) {
  return (
    <nav className="socials" aria-label="Redes sociais">
      {items.map((s) => {
        const icon = ICONS[s.id];
        if (!icon) return null;
        const svg = (
          <svg viewBox={icon.viewBox} width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d={icon.d} />
          </svg>
        );

        // sem url: ícone apagado, sem link, sem foco de teclado
        if (!s.url) {
          return (
            <span key={s.id} className="social social-off" aria-label={`${s.label}: em breve`}>
              {svg}
              <span className="social-tip"><b>{s.label}</b>em breve</span>
            </span>
          );
        }

        const handle = handleFromUrl(s.url);
        return (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
             className="social" aria-label={`${s.label}${handle ? " " + handle : ""}`}>
            {svg}
            <span className="social-tip"><b>{s.label}</b>{handle}</span>
          </a>
        );
      })}
    </nav>
  );
}
