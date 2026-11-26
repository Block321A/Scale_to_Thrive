import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type Role = "admin" | "company" | "enrollee";
export type Profile = { id: string; role: Role; full_name: string | null; email: string; phone: string | null; photo_url: string | null };

// cache() means the layout and the page share one lookup per request.
// The signed token is verified locally; the role always comes fresh from the database.
// Who is signed in (from the signed token). Cheap; lets a page start its own queries right away.
export const getUserId = cache(async (): Promise<string | null> => {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const uid = await getUserId();
  if (!uid) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id, role, full_name, email, phone, photo_url").eq("id", uid).single();
  return (profile as Profile) ?? null;
});

export const homeFor = (role: Role) => (role === "admin" ? "/admin" : role === "company" ? "/company" : "/profile");

// Use at the top of a protected page. Sends the visitor to login or to their own area.
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(homeFor(profile.role));
  return profile;
}
