"use client";
import { BADGES } from "../lib/icons";

// Selos decorativos ao lado do nome. Vêm de profile.badges, em lib/config.js.
export default function Badges({ items }) {
  const list = (items || []).filter((b) => BADGES[b.id]);
  if (!list.length) return null;

  return (
    <span className="badges">
      {list.map((b) => {
        const icon = BADGES[b.id];
        return (
          <span key={b.id} className="badge" tabIndex={0} role="img"
                style={{ "--badge": b.color || "currentColor" }}
                aria-label={b.label} data-cursor="hover">
            <svg viewBox={icon.viewBox} width="25" height="25" fill="currentColor" aria-hidden="true">
              <path d={icon.d} />
            </svg>
            <span className="badge-tip">{b.label}</span>
          </span>
        );
      })}
    </span>
  );
}
