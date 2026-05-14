import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (r.error) setErr(String(r.error));
    if (!r.redirected && !r.error) navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-pop-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white border-2 border-pop-ink rounded-3xl p-8 shadow-pop-pink">
        <Link to="/" className="font-display text-3xl text-pop-blue">
          Soul Legacy
        </Link>
        <h1 className="font-display text-3xl uppercase text-pop-blue mt-6">
          {mode === "signin" ? "Welcome back" : "Start your soul"}
        </h1>
        <p className="mt-2 text-sm font-semibold text-pop-ink/60">
          {mode === "signin"
            ? "Sign in to your vault."
            : "Make an account in 30 seconds."}
        </p>

        <button
          onClick={onGoogle}
          className="mt-6 w-full py-3 rounded-full border-2 border-pop-ink bg-white font-bold uppercase text-sm hover:bg-pop-yellow transition-colors"
        >
          Continue with Google
        </button>

        <div className="my-6 text-center text-xs font-bold uppercase tracking-widest text-pop-ink/40">
          or
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
            />
          )}
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-pop-ink font-semibold"
          />
          {err && (
            <p className="text-sm font-bold text-pop-pink">{err}</p>
          )}
          <button
            disabled={busy}
            className="w-full py-3 rounded-full bg-pop-pink text-white font-bold uppercase border-2 border-pop-ink shadow-pop-blue disabled:opacity-60"
          >
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-sm font-bold text-pop-blue hover:text-pop-pink"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
