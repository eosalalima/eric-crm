"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { PasswordInput } from "@/components/password-input";

type Mode = "register" | "login" | "forgot" | "reset" | "verify";

async function post(path: string, body: object) {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || "Something went wrong. Please try again.");
  return data;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "register") {
        if (values.password !== values.confirmPassword) throw new Error("Passwords do not match.");
        await post("/api/register", values);
        router.push("/register/success");
      } else if (mode === "login") {
        await post("/api/auth/sign-in/email", { email: values.email, password: values.password });
        const result = await fetch("/api/session/destination").then(r => r.json());
        router.push(result.destination);
      } else if (mode === "forgot") {
        await post("/api/auth/forget-password", { email: values.email, redirectTo: `${location.origin}/reset-password` }).catch(() => undefined);
        setMessage("If an account exists for that address, password-reset instructions are on their way.");
      } else if (mode === "reset") {
        if (values.password !== values.confirmPassword) throw new Error("Passwords do not match.");
        await post("/api/auth/reset-password", { newPassword: values.password, token: params.get("token") });
        setMessage("Your password has been updated. You can now sign in.");
      } else {
        await post("/api/auth/send-verification-email", { email: values.email, callbackURL: `${location.origin}/verify-email` });
        setMessage("Verification email sent. Check your inbox and spam folder.");
        setCooldown(true); window.setTimeout(() => setCooldown(false), 60000);
      }
    } catch (cause) {
      setError(mode === "login" ? "Email or password is incorrect." : cause instanceof Error ? cause.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  if (mode === "verify") return <form onSubmit={submit} className="auth-form"><label className="field"><span>Email address</span><input name="email" type="email" required autoComplete="email"/></label>{message && <p className="notice success" role="status">{message}</p>}{error && <p className="notice error" role="alert">{error}</p>}<button className="primary-action" disabled={busy || cooldown}>{cooldown ? "Resend available in 60 seconds" : busy ? "Sending…" : "Resend verification email"}</button></form>;

  return <form onSubmit={submit} className="auth-form">
    {mode === "register" && <div className="field-grid"><label className="field"><span>First name</span><input name="firstName" required autoComplete="given-name"/></label><label className="field"><span>Last name</span><input name="lastName" required autoComplete="family-name"/></label></div>}
    {(mode === "register" || mode === "login" || mode === "forgot") && <label className="field"><span>Email address</span><input name="email" type="email" required autoComplete="email"/></label>}
    {(mode === "register" || mode === "login" || mode === "reset") && <PasswordInput autoComplete={mode === "login" ? "current-password" : "new-password"}/>} 
    {(mode === "register" || mode === "reset") && <><PasswordInput name="confirmPassword" label="Confirm password" autoComplete="new-password"/><p className="password-help">Use at least 8 characters. Neon Auth applies any additional password policy configured for this project.</p></>}
    {mode === "register" && <div className="field-grid"><label className="field"><span>Mobile number <i>Optional</i></span><input name="mobile" type="tel" autoComplete="tel"/></label><label className="field"><span>Job title <i>Optional</i></span><input name="jobTitle" autoComplete="organization-title"/></label></div>}
    {message && <p className="notice success" role="status">{message}</p>}{error && <p className="notice error" role="alert">{error}</p>}
    <button className="primary-action" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : mode === "login" ? "Sign in" : mode === "forgot" ? "Send reset instructions" : "Reset password"}</button>
    {mode === "login" && <div className="form-links"><Link href="/forgot-password">Forgot password?</Link><span>New to EricCRM? <Link href="/register">Create account</Link></span></div>}
    {mode === "register" && <p className="form-switch">Already have an account? <Link href="/login">Sign in</Link></p>}
    {(mode === "forgot" || mode === "reset") && <p className="form-switch"><Link href="/login">Back to sign in</Link></p>}
  </form>;
}
