"use client";
import { useState } from "react";

export function PasswordInput({ name = "password", label = "Password", autoComplete = "current-password", minLength = 8 }: { name?: string; label?: string; autoComplete?: string; minLength?: number }) {
  const [visible, setVisible] = useState(false);
  return <label className="field"><span>{label}</span><span className="password-wrap"><input name={name} type={visible ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete}/><button type="button" onClick={() => setVisible(v => !v)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}>{visible ? "Hide" : "Show"}</button></span></label>;
}
