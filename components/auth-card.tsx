import { Brand } from "@/components/brand";
import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="auth-page"><section className="auth-card"><Brand/><header><h1>{title}</h1><p>{subtitle}</p></header>{children}</section><p className="auth-foot">Secure access powered by Neon Auth</p></main>;
}
