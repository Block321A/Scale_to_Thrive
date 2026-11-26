import { createClient, createAdminClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { saveEmailSettings, sendTestEmail } from "../actions";
import { field, btn, btnGhost, card } from "@/lib/ui";

export default async function Settings({ searchParams }: PageProps<"/admin/settings">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key, value").like("key", "smtp_%");
  const s = Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as string]));
  const hasPassword = Boolean((await createAdminClient().rpc("has_app_secret", { secret_name: "smtp_password" })).data);
  const ready = Boolean(s.smtp_host && s.smtp_user && hasPassword);

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Email settings</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        The website sends application, shortlisting, rejection, congratulations and job emails through this mail account.
        Set-password and reset-password emails are sent by Supabase and are not affected.
      </p>
      <Notice ok={sp.ok} err={sp.err} />

      <div className={card + " mb-6"}>
        <p className="text-sm">Status: <strong className={ready ? "text-green-700" : "text-amber-700"}>{ready ? "Ready to send" : "Not set up yet"}</strong></p>
      </div>

      <form action={saveEmailSettings} className={card + " mb-6 grid gap-4 sm:grid-cols-2"}>
        <label className="text-sm">Mail server (host)<input name="host" required defaultValue={s.smtp_host ?? "smtp.gmail.com"} className={field} /></label>
        <label className="text-sm">Port<input name="port" type="number" required defaultValue={s.smtp_port ?? "465"} className={field} /></label>
        <label className="text-sm">Email address (username)<input name="user" type="email" required defaultValue={s.smtp_user ?? ""} placeholder="scaletothrive@gmail.com" className={field} /></label>
        <label className="text-sm">Sender name<input name="from_name" defaultValue={s.smtp_from_name ?? "Scale to Thrive"} className={field} /></label>
        <label className="text-sm sm:col-span-2">
          App password {hasPassword && <span className="text-green-700">(saved. Leave empty to keep it)</span>}
          <input name="password" type="password" autoComplete="new-password" placeholder={hasPassword ? "••••••••••••••••" : "16-letter app password"} className={field} />
        </label>
        <div className="sm:col-span-2"><button className={btn}>Save settings</button></div>
      </form>

      <form action={sendTestEmail} className={card + " mb-6 flex flex-wrap items-center justify-between gap-3"}>
        <p className="text-sm text-muted">Sends a test email to your own admin address.</p>
        <button className={btnGhost}>Send test email</button>
      </form>

      <div className={card}>
        <h2 className="font-semibold">How to get the Gmail app password</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
          <li>Sign in to the Gmail account that will send the emails.</li>
          <li>Open <strong>myaccount.google.com → Security</strong> and turn on <strong>2-Step Verification</strong> (add a phone number if asked).</li>
          <li>Open <strong>myaccount.google.com/apppasswords</strong>, type a name such as <em>Scale to Thrive website</em> and click <strong>Create</strong>.</li>
          <li>Copy the 16-letter code Google shows. It appears only once. Paste it above (spaces are fine).</li>
          <li>Settings for Gmail: server <strong>smtp.gmail.com</strong>, port <strong>465</strong>, username your full Gmail address.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">The password is stored encrypted in your database and is never shown again.</p>
      </div>
    </>
  );
}
