import { useState, type FormEvent } from "react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Field, Muted, Pill } from "./ui";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);

  const passwordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setState("sending");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setState("idle");
    if (error) setError(/confirm/i.test(error.message) ? "Please confirm your email first — check your inbox for the link." : "That email and password didn't match. Please try again.");
  };

  const sendLink = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("That email doesn't look quite right.");
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/settings` },
    });
    if (error) { setState("idle"); setError("We couldn't send your sign-in link just now. Check the email address and try again in a moment."); return; }
    setState("sent");
  };

  const google = async () => {
    setError("");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setError("Google sign-in didn't finish, so you're still signed out. Please try again.");
  };

  if (state === "sent")
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-sage-soft p-4">
        <b>Check your email.</b>
        <Muted>We sent a sign-in link to {email.trim()}. Tap it on this device and your garden comes with you.</Muted>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <Pill variant="ghost" type="button" onClick={google}>
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
        </svg>
        Continue with Google
      </Pill>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <form onSubmit={usePassword ? passwordSignIn : sendLink} noValidate className="flex flex-col gap-3">
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        {usePassword && <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        <Pill type="submit" disabled={state === "sending"}>{state === "sending" ? "One moment…" : usePassword ? "Sign in" : "Email me a sign-in link"}</Pill>
        <button type="button" onClick={() => setUsePassword((v) => !v)} className="min-h-11 text-sm font-bold text-plum underline">{usePassword ? "Use an email link instead" : "Sign in with a password"}</button>
      </form>
      {error && <p className="text-sm font-bold text-rose" role="alert">{error}</p>}
      <Muted className="text-xs">No password needed for email links. We only store what your garden needs.</Muted>
    </div>
  );
}
