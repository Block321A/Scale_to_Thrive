import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type Role = "admin" | "company" | "enrollee";
export type Profile = { id: string; role: Role; full_name: string | null; email: string; phone: string | null; photo_url: string | null };

export async function getProfile(): Promise<Profile | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, role, full_name, email, phone, photo_url").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

export const homeFor = (role: Role) => (role === "admin" ? "/admin" : role === "company" ? "/company" : "/profile");

// Use at the top of a protected page. Sends the visitor to login or to their own area.
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(homeFor(profile.role));
  return profile;
}
