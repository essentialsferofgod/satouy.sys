"use client";
import { useEffect, useRef, useState } from "react";

// Digita, segura, apaga e passa para a próxima frase.
// Uma frase só: digita e para. Movimento reduzido: mostra a primeira inteira.
export default function useTypewriter(phrases, opts = {}) {
  const {
    typeMs = 55,      // velocidade de digitação
    deleteMs = 26,    // velocidade ao apagar
    holdMs = 2600,    // pausa com a frase completa
    gapMs = 420,      // pausa entre uma frase e a próxima
    startDelay = 0,
    enabled = true,
  } = opts;

  const list = (phrases || []).filter(Boolean);
  const key = list.join("\u0000");
  const [text, setText] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    const items = key ? key.split("\u0000") : [];
    if (!items.length) { setText(""); return; }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced) { setText(items[0]); return; }

    let i = 0, n = 0, deleting = false, alive = true;
    const wait = (ms) => { timer.current = setTimeout(step, ms); };

    function step() {
      if (!alive) return;
      const phrase = items[i];

      if (!deleting) {
        n++;
        setText(phrase.slice(0, n));
        if (n < phrase.length) return wait(typeMs);
        if (items.length === 1) return;        // nada a alternar
        deleting = true;
        return wait(holdMs);
      }

      n--;
      setText(phrase.slice(0, n));
      if (n > 0) return wait(deleteMs);
      deleting = false;
      i = (i + 1) % items.length;
      wait(gapMs);
    }

    wait(startDelay);
    return () => { alive = false; clearTimeout(timer.current); };
  }, [key, typeMs, deleteMs, holdMs, gapMs, startDelay, enabled]);

  return text;
}
