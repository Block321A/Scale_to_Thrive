import { createAdminClient } from "@/lib/supabase/server";
import { createImplicitClient } from "@/lib/supabase/implicit";
import { siteUrl } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email";
import * as T from "@/lib/email-templates";

const redirectTo = `${siteUrl}/set-password`;

export type InviteKind = { kind: "enrollee"; track: string } | { kind: "company" } | { kind: "admin" };

// Creates the login account. Supabase sends the set-password email for everyone.
// Enrollees and companies also get a separate congratulations / welcome email from our own mailer.
export async function inviteUser(email: string, fullName: string, who: InviteKind) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: fullName ? { full_name: fullName } : undefined,
    redirectTo,
  });
  if (error || !data?.user) return { ok: false as const, error: error?.message ?? "Could not create the account" };

  if (who.kind === "admin") return { ok: true as const, userId: data.user.id, emailed: true, welcomed: true };
  const welcome = who.kind === "enrollee" ? T.enrolleeSelected(siteUrl, fullName, who.track) : T.companyWelcome(siteUrl, fullName);
  const welcomed = await sendEmail(email, welcome);
  return { ok: true as const, userId: data.user.id, emailed: true, welcomed };
}

// Forgot password / resend set-password: Supabase's own reset procedure (unchanged).
export async function sendPasswordLink(email: string) {
  await createImplicitClient().auth.resetPasswordForEmail(email, { redirectTo });
}
