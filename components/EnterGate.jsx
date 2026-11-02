"use client";
import LiquidButton from "./LiquidButton";

export default function EnterGate({ onEnter, leaving }) {
  return (
    <div className={`gate ${leaving ? "gate-out" : ""}`}>
      <LiquidButton label="entrar" onClick={onEnter} ariaLabel="Entrar no site" />
    </div>
  );
}
