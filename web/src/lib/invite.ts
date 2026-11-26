import { createAdminClient } from "@/lib/supabase/server";
import { createImplicitClient } from "@/lib/supabase/implicit";
import { siteUrl } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email";
import * as T from "@/lib/email-templates";

const redirectTo = `${siteUrl}/set-password`;

export type InviteKind = { kind: "enrollee"; track: string } | { kind: "company" } | { kind: "admin" };

// Creates the login account.
// Enrollees and companies: Supabase sends the set-password email, and we send a separate branded
// congratulations email that explains the purpose and tells them to use that set-password email.
// Admins: we send one branded email that contains the set-password link.
export async function inviteUser(email: string, fullName: string, who: InviteKind) {
  const admin = createAdminClient();

  if (who.kind === "admin") {
    const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } });
    if (error || !data?.user) return { ok: false as const, error: error?.message ?? "Could not create the account" };
    let emailed = await sendEmail(email, T.adminInvite(siteUrl, data.properties.action_link));
    if (!emailed) emailed = !(await createImplicitClient().auth.resetPasswordForEmail(email, { redirectTo })).error;
    return { ok: true as const, userId: data.user.id, emailed, welcomed: true };
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: fullName ? { full_name: fullName } : undefined,
    redirectTo,
  });
  if (error || !data?.user) return { ok: false as const, error: error?.message ?? "Could not create the account" };

  const welcome = who.kind === "enrollee" ? T.enrolleeSelected(siteUrl, fullName, who.track) : T.companyWelcome(siteUrl, fullName);
  const welcomed = await sendEmail(email, welcome);
  return { ok: true as const, userId: data.user.id, emailed: true, welcomed };
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
