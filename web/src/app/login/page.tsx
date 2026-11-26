import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, homeFor, type Role } from "@/lib/auth";
import SubmitButton from "@/components/SubmitButton";
import { supabaseConfigured } from "@/lib/supabase/env";
import { sendPasswordLink } from "@/lib/invite";

async function signIn(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password")),
  });
  if (error || !data.user) redirect("/login?error=credentials");
  // Use the id from sign-in directly (no second token check)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  redirect(profile ? homeFor(profile.role as Role) : "/");
}

async function forgot(formData: FormData) {
  "use server";
  await sendPasswordLink(String(formData.get("email")).trim());
  redirect("/login?sent=1");
}

const field = "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  if (supabaseConfigured) {
    const p = await getProfile();
    if (p) redirect(homeFor(p.role));
  }
  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted">For admins, companies and enrolled students.</p>
      {sp.error === "credentials" && <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">Wrong email or password.</p>}
      {sp.error === "link" && <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">That link is invalid or has expired. Ask for a new one.</p>}
      {sp.done && <p className="mt-6 rounded-xl bg-green-50 p-3 text-sm text-green-800">Password saved. You can sign in now.</p>}
      {sp.sent && <p className="mt-6 rounded-xl bg-green-50 p-3 text-sm text-green-800">If that email has an account, a reset link is on its way.</p>}
      {!supabaseConfigured && <p className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">The database is not connected yet.</p>}
      <form action={signIn} className="mt-8 space-y-4">
        <input name="email" type="email" required placeholder="Email" className={field} />
        <input name="password" type="password" required placeholder="Password" className={field} />
        <SubmitButton pending="Signing in…" className="w-full rounded-full bg-accent py-3 font-medium text-white hover:bg-[#0077ed] disabled:opacity-70">Sign in</SubmitButton>
      </form>
      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-accent">Forgot your password?</summary>
        <form action={forgot} className="mt-3 flex gap-2">
          <input name="email" type="email" required placeholder="Your email" className={field} />
          <button className="rounded-full bg-surface px-5 font-medium">Send link</button>
        </form>
      </details>
    </div>
  );
}
