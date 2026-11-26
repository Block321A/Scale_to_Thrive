import { createAdminClient } from "@/lib/supabase/server";
import { createImplicitClient } from "@/lib/supabase/implicit";
import { siteUrl } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email";
import * as T from "@/lib/email-templates";

const redirectTo = `${siteUrl}/set-password`;

export type InviteKind = { kind: "enrollee"; track: string } | { kind: "company" } | { kind: "admin" };

// Creates the login account and emails a branded set-password link (our own template).
// If our mailer is not set up, falls back to Supabase's plain email so the person is never left without a link.
export async function inviteUser(email: string, fullName: string, who: InviteKind) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: fullName ? { full_name: fullName } : undefined, redirectTo },
  });
  if (error || !data?.user) return { ok: false as const, error: error?.message ?? "Could not create the account" };

  const link = data.properties.action_link;
  const mail =
    who.kind === "enrollee" ? T.enrolleeSelected(siteUrl, fullName, who.track, link)
    : who.kind === "company" ? T.companyWelcome(siteUrl, fullName, link)
    : T.adminInvite(siteUrl, link);

  let emailed = await sendEmail(email, mail);
  if (!emailed) emailed = !(await createImplicitClient().auth.resetPasswordForEmail(email, { redirectTo })).error;
  return { ok: true as const, userId: data.user.id, emailed };
}

// Sends a branded password link to an existing account. Never reveals whether the account exists.
export async function sendPasswordLink(email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
  if (error || !data?.properties) return;
  const name = (data.user?.user_metadata?.full_name as string | undefined) ?? "";
  const sent = await sendEmail(email, T.passwordReset(siteUrl, name, data.properties.action_link));
  if (!sent) await createImplicitClient().auth.resetPasswordForEmail(email, { redirectTo });
}
