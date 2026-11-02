"use client";
import { useEffect, useState } from "react";

// Contador de visitas via Abacus (abacus.jasoncameron.dev): gratuito, sem
// cadastro e sem back-end próprio. Conta uma vez por aba aberta.
// Se o serviço cair, o contador some em silêncio — nada quebra.
export default function ViewCounter({ namespace, keyName = "visits" }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!namespace) return;
    const base = `https://abacus.jasoncameron.dev`;
    const guard = `pf-counted:${namespace}:${keyName}`;
    let alive = true;
    const ctrl = new AbortController();

    // já contou nesta aba? então só lê, não incrementa
    let jaContou = false;
    try { jaContou = sessionStorage.getItem(guard) === "1"; } catch {}
    const url = `${base}/${jaContou ? "get" : "hit"}/${encodeURIComponent(namespace)}/${encodeURIComponent(keyName)}`;

    (async () => {
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        if (!alive || typeof j?.value !== "number") return;
        setCount(j.value);
        try { sessionStorage.setItem(guard, "1"); } catch {}
      } catch { /* serviço fora do ar: não mostra nada */ }
    })();

    return () => { alive = false; ctrl.abort(); };
  }, [namespace, keyName]);

  if (count === null) return null;

  return (
    <div className="views" title={`${count.toLocaleString("pt-BR")} visitas`}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
           strokeWidth="1.8" aria-hidden="true">
        <path d="M1.8 12S5.5 5.5 12 5.5 22.2 12 22.2 12 18.5 18.5 12 18.5 1.8 12 1.8 12z" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
      <span>{count.toLocaleString("pt-BR")}</span>
    </div>
  );
}
