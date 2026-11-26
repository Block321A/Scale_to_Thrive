import { createAdminClient } from "@/lib/supabase/server";

export type SmtpConfig = { host: string; port: number; user: string; pass: string; fromName: string };

let cache: { at: number; cfg: SmtpConfig | null } | null = null;
export const clearSmtpCache = () => { cache = null; };

// SMTP details come from the admin Settings page (stored in the database, password in Vault).
// SMTP_* environment variables are still honoured as a fallback.
export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  if (cache && Date.now() - cache.at < 30_000) return cache.cfg;
  let cfg: SmtpConfig | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("app_settings").select("key, value").like("key", "smtp_%");
      const s = Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as string]));
      const pass = (await admin.rpc("get_app_secret", { secret_name: "smtp_password" })).data as string | null;
      if (s.smtp_host && s.smtp_user && pass) {
        cfg = { host: s.smtp_host, port: Number(s.smtp_port) || 465, user: s.smtp_user, pass, fromName: s.smtp_from_name || "Scale to Thrive" };
      }
    } catch {
      // settings tables not created yet: fall through to environment variables
    }
  }
  if (!cfg && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cfg = { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 465, user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, fromName: "Scale to Thrive" };
  }
  cache = { at: Date.now(), cfg };
  return cfg;
}
