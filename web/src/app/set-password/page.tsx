"use client";

import { useEffect, useRef, useState } from "react";
import { createImplicitClient } from "@/lib/supabase/implicit";

const field = "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function SetPassword() {
  const supabase = useRef<ReturnType<typeof createImplicitClient> | null>(null);
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const client = createImplicitClient();
    supabase.current = client;
    // The link carries a token in the address; the client turns it into a session.
    client.auth.getSession().then(({ data }) => {
      if (data.session) setReady("ok");
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => {
      if (session) setReady("ok");
    });
    const t = setTimeout(() => setReady((r) => (r === "checking" ? "invalid" : r)), 4000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("password"));
    if (pw.length < 10) return setMsg("Use at least 10 characters.");
    if (pw !== f.get("confirm")) return setMsg("The passwords do not match.");
    setBusy(true);
    const { error } = await supabase.current!.auth.updateUser({ password: pw });
    if (error) {
      setBusy(false);
      return setMsg(error.message);
    }
    await supabase.current!.auth.signOut();
    window.location.href = "/login?done=1";
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Set your password</h1>
      {ready === "checking" && <p className="mt-4 text-muted">Checking your link...</p>}
      {ready === "invalid" && (
        <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">This link is invalid or has expired. Ask the admin to resend it, or use &quot;Forgot your password?&quot; on the sign-in page.</p>
      )}
      {ready === "ok" && (
        <>
          <p className="mt-2 text-muted">Choose a password to finish setting up your account, then sign in.</p>
          {msg && <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input name="password" type="password" required placeholder="New password (10+ characters)" className={field} />
            <input name="confirm" type="password" required placeholder="Confirm password" className={field} />
            <button disabled={busy} className="w-full rounded-full bg-accent py-3 font-medium text-white disabled:opacity-60">Save password</button>
          </form>
        </>
      )}
    </div>
  );
}
